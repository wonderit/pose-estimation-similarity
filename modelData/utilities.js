import * as tf from "@tensorflow/tfjs";
import * as poseDetection from "@tensorflow-models/pose-detection";
import "@tensorflow/tfjs-backend-webgl";

// 뒤꿈치 들기(좌) heel lifting(left)
import Ankle1 from "utils/modelData/Ankle1.json";
// 뒤꿈치 들기(우) heel lifting(right)
import Ankle2 from "utils/modelData/Ankle2.json";
// 발목 굴곡신전(좌) ankle flexion & extension(left)
import Ankle3 from "utils/modelData/Ankle3.json";
// 발목 굴곡신전(우) ankle flexion & extension(right)
import Ankle4 from "utils/modelData/Ankle4.json";
// 무릎 굴곡신전(좌) knee flexion & extension(left)
import Knee1 from "utils/modelData/Knee1.json";
// 무릎 굴곡신전(우) knee flexion & extension(right)
import Knee2 from "utils/modelData/Knee2.json";
// 스쿼트 Squatting
import Knee3 from "utils/modelData/Knee3.json";
// 능동 외전(좌) Abduction(left)
import Shoulder1 from "utils/modelData/Shoulder1.json";
// 능동 외전(우) Abduction(right)
import Shoulder2 from "utils/modelData/Shoulder2.json";
// 능동 전방 굴곡(좌) Further flextion(left)
import Shoulder3 from "utils/modelData/Shoulder3.json";
// 능동 전방 굴곡(우) Further flextion(right)
import Shoulder4 from "utils/modelData/Shoulder4.json";

const exerciseData = {
    Ankle1: Ankle1,
    Ankle2: Ankle2,
    Ankle3: Ankle3,
    Ankle4: Ankle4,
    Knee1: Knee1,
    Knee2: Knee2,
    Knee3: Knee3,
    Shoulder1: Shoulder1,
    Shoulder2: Shoulder2,
    Shoulder3: Shoulder3,
    Shoulder4: Shoulder4,
};

const BLAZEPOSE_CONFIG = {
    maxPoses: 1,
    scoreThreshold: 0.65,
    runtime: "tfjs",
    enableSmoothing: true,
    modelType: "full", //lite, full, heavy
    indexStart: 11,
    indexEnd: 33, //32 -> 33
};


// 11: left_shoulder  \
// 12: right_shoulder  \
// 13: left_elbow  \
// 14: right_elbow  \
// 15: left_wrist  \
// 16: right_wrist  \

// 17: left_pinky  \
// 18: right_pinky  \
// 19: left_index  \
// 20: right_index  \
// 21: left_thumb  \
// 22: right_thumb  \

// 23: left_hip  \
// 24: right_hip  \
// 25: left_knee  \
// 26: right_knee  \
// 27: left_ankle  \
// 28: right_ankle  \

// 29: left_heel  \
// 30: right_heel  \
// 31: left_foot_index  \
// 32: right_foot_index


const POSE_WEIGHT = {
    // 기본 weight: 균등
    default: [
        5, 5, 5, 5, 5, 5,
        5, 5, 5, 5, 5, 5,
        5, 5, 5, 5, 5, 5,
        5, 5, 5, 5,
    ],
    // heel, foot에 가중치 10, hip, knee, ankle에 가중치 3
    Ankle1: [
        1, 1, 1, 1, 1, 1,
        1, 1, 1, 1, 1, 1,
        3, 3, 3, 3, 3, 3,
        10, 10, 10, 10,
    ]
}

// 유사성 임계값 설정
const SIMILARITY_THRESHOLD = 0.15;

// 운동별 점수 기준
const SCORE_CRITERIA = {
    Ankle1: [0.03, 0.05, 0.07],
    Ankle2: [0.03, 0.05, 0.07],
    Ankle3: [0.03, 0.05, 0.07],
    Ankle4: [0.03, 0.05, 0.07],
    Knee1: [0.03, 0.05, 0.07],
    Knee2: [0.03, 0.05, 0.07],
    Knee3: [0.03, 0.05, 0.07],
    Shoulder1: [0.03, 0.05, 0.07],
    Shoulder2: [0.03, 0.05, 0.07],
    Shoulder3: [0.03, 0.05, 0.07],
    Shoulder4: [0.03, 0.05, 0.07],
};

export const videoSetting = (video, exercise, callback) => {
    const videoElement = document.createElement("video");
    videoElement.src = URL.createObjectURL(video);
    videoElement.muted = true;
    videoElement.preload = "auto";
    let result;
    videoElement.onloadeddata = async () => {
        const detector = await poseDetection.createDetector(
            poseDetection.SupportedModels.BlazePose,
            {
                runtime: "tfjs",
            }
        );

        videoElement.play();
        result = await detect(detector, videoElement, exercise);
        callback(result);
    };
};

const detect = async (net, video, exercise) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // const results = [];
    let compareIndex = 0;
    var max = 0,
        my = 0,
        great = 0,
        good = 0,
        soso = 0,
        bad = 0;

    while (!video.ended) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const pose = await net.estimatePoses(canvas);
        if (pose.length !== 0) {
            let weightedDistance = poseSimilarity(
                exerciseData[exercise][
                    compareIndex % exerciseData[exercise].length
                ].slice(BLAZEPOSE_CONFIG.indexStart, BLAZEPOSE_CONFIG.indexEnd),
                pose[0].keypoints3D.slice(
                    BLAZEPOSE_CONFIG.indexStart,
                    BLAZEPOSE_CONFIG.indexEnd
                ),
                exercise
            );

            let result = getScore(weightedDistance, exercise);

            max += result[0];
            my += result[1];
            great += result[2];
            good += result[3];
            soso += result[4];
            bad += result[5];
            if (weightedDistance <= SIMILARITY_THRESHOLD) {
                // results.push(pose[0]);
                compareIndex++;
            }
        }

        await new Promise((resolve) => setTimeout(resolve, 1000 / 30));
    }
    let result = {
        max: max,
        my: my,
        great: great,
        good: good,
        bad: bad,
        final: (100 * my) / max,
        // result: results,
    };

    return result;
};

const getScore = (weight, exercise) => {
    console.log(weight);
    var maxScore = 3,
        myScore = 0,
        great_cnt = 0,
        good_cnt = 0,
        soso_cnt = 0,
        bad_cnt = 0;
    if (weight <= SCORE_CRITERIA[exercise][0]) {
        // great
        myScore += 3;
        great_cnt += 1;
    } else if (weight <= SCORE_CRITERIA[exercise][1]) {
        // good
        myScore += 2;
        good_cnt += 1;
    } else if (weight <= SCORE_CRITERIA[exercise][2]) {
        // soso
        myScore += 1;
        soso_cnt += 1;
    } else {
        // bad
        bad_cnt += 1;
    }
    return [maxScore, myScore, great_cnt, good_cnt, soso_cnt, bad_cnt];
};

// Add Pose Weight for exercise
const weightedDistanceMatching = (
    vectorPose1XY,
    vectorPose2XY,
    vectorConfidences,
    exercise
) => {
    const summation1 = 1 / vectorConfidences[vectorConfidences.length - 1];
    var summation2 = 0;
    var summation_weights = 1 / POSE_WEIGHT[exercise].reduce((pv, cv) => pv+cv, 0);

    for (var i = 0; i < vectorPose1XY.length; i++) {
        var confIndex = Math.floor(i / 2);
        summation2 +=
            POSE_WEIGHT[exercise][confIndex] *
            vectorConfidences[confIndex] *
            Math.abs(vectorPose1XY[i] - vectorPose2XY[i]);
    }
    return summation_weights * (vectorConfidences.length - 1) * summation1 * summation2;
};

const convertPoseToVector = (pose) => {
    var vectorPoseXY = [];

    var translateX = Number.POSITIVE_INFINITY;
    var translateY = Number.POSITIVE_INFINITY;
    var scaler = Number.NEGATIVE_INFINITY;

    var vectorScoresSum = 0;
    var vectorScores = [];

    // get weightOption if exists
    var mode = "add";
    var scores = Array;

    pose.forEach(function (point, index) {
        var x = point.x;
        var y = point.y;
        vectorPoseXY.push(x, y);
        translateX = Math.min(translateX, x);
        translateY = Math.min(translateY, y);
        scaler = Math.max(scaler, Math.max(x, y));
        var score = point.score;
        // modify original score according to the weightOption
        if (mode && scores) {
            var scoreModifier = false;
            // try to get scores from the weightOption
            if (scores[point.name] || scores[point.name] === 0)
                scoreModifier = scores[point.name];
            if (scores[index] || scores[index] === 0)
                scoreModifier = scores[index];
            // manipulate the original score
            if (
                (scoreModifier || scoreModifier === 0) &&
                typeof scoreModifier === "number"
            ) {
                switch (mode) {
                    case "multiply":
                        score *= scoreModifier;
                        break;
                    case "replace":
                        score = scoreModifier;
                        break;
                    case "add":
                        score += scoreModifier;
                        break;
                    default:
                        throw new Error(
                            "[Bad customWeight option] A mode must be specified and should be either 'multiply', 'replace' or 'add'"
                        );
                }
            }
        }
        vectorScoresSum += score;
        vectorScores.push(score);
    });
    vectorScores.push(vectorScoresSum);
    return [
        vectorPoseXY,
        [translateX / scaler, translateY / scaler, scaler],
        vectorScores,
    ];
};

const scaleAndTranslate = (vectorPoseXY, transformValues) => {
    var transX = transformValues[0],
        transY = transformValues[1],
        scaler = transformValues[2];
    return vectorPoseXY.map(function (position, index) {
        return index % 2 === 0
            ? position / scaler - transX
            : position / scaler - transY;
    });
};

const L2Normalization = (vectorPoseXY) => {
    var absVectorPoseXY = 0;
    vectorPoseXY.forEach(function (position) {
        absVectorPoseXY += Math.pow(position, 2);
    });
    absVectorPoseXY = Math.sqrt(absVectorPoseXY);
    return vectorPoseXY.map(function (position) {
        return position / absVectorPoseXY;
    });
};
const vectorizeAndNormalize = (pose) => {
    var _a = convertPoseToVector(pose);
    var vectorPoseXY = _a[0];
    var vectorPoseTransform = _a[1];
    var vectorPoseConfidences = _a[2];

    vectorPoseXY = scaleAndTranslate(vectorPoseXY, vectorPoseTransform);

    vectorPoseXY = L2Normalization(vectorPoseXY);

    return [vectorPoseXY, vectorPoseConfidences];
};

const poseSimilarity = (pose1, pose2, exercise) => {
    var _a = vectorizeAndNormalize(pose1);
    var vectorPose1XY = _a[0];
    var vectorPose1Scores = _a[1];

    var vectorPose2XY = vectorizeAndNormalize(pose2)[0];
    return weightedDistanceMatching(
        vectorPose1XY,
        vectorPose2XY,
        vectorPose1Scores,
        exercise
    );
};

tf.setBackend("webgl").then(() => {});
