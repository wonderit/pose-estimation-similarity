import { Camera } from './camera.js';
import {BLAZEPOSE_CONFIG, STATE} from './params.js';
import { setupStats } from './stats_panel.js';
import { setBackendAndEnvFlags } from './util.js';

let detector, camera, stats, detector2;
let rafId;
let startInferenceTime, numInferences = 0;
let inferenceTimeSum = 0, lastPanelUpdate = 0;

// variants for video
var video = document.getElementById("video");

// get jsFileName from video.src (e.g.: "video/1c.mp4#t=0.1" -> "1c")
let jsFileName = video.src.split("/").pop().split("#")[0].split(".")[0];

var canvasVideo = document.createElement('canvas');
canvasVideo.width = video.offsetWidth;
canvasVideo.height = video.offsetHeight;

// varients for webcam
var webcam = document.getElementById('webcam');
var canvasWebcam = document.createElement('output'); //score 보여줄 태그

var weightedDistance;
var webcamPoses, videoPoses;

var maxScore = 0;
var myScore = 0;

var videoFlag = false;

// 최종 Score 계산
let great_cnt = 0, good_cnt = 0, soso_cnt = 0, bad_cnt = 0;

function getScore(weight) {
    maxScore += 3;
    if (weight <= 0.08) { // great
        myScore += 3;
        great_cnt++;
    }
    else if (weight <= 0.11) { // good
        myScore += 2;
        good_cnt++;
    }
    else if (weight <= 0.15) { // soso
        myScore += 1;
        soso_cnt++;
    }
    else { // bad
        bad_cnt++;
    }

    const finalScore = getFinalScore();
    let finalScoreText = 'Bad';
    if (finalScore >= 60) {
        finalScoreText = 'Great';
    } else if (finalScore >= 40) {
        finalScoreText = 'Good';
    } else if (finalScore >= 20) {
        finalScoreText = 'SoSo';
    }

    // $('.score_text').text(parseInt(getFinalScore()))
    $('.score_text').text(`${finalScoreText}(${parseInt(finalScore)})`)
    $('.great').text(great_cnt)
    $('.good').text(good_cnt)
    $('.soso').text(soso_cnt)
    $('.bad').text(bad_cnt)
}

function getFinalScore() {
    return 100 * myScore / maxScore;
}

//skeleton overlay
function beginEstimatePosesStats() {
    startInferenceTime = (performance || Date).now();
}

function endEstimatePosesStats() {
    const endInferenceTime = (performance || Date).now();
    inferenceTimeSum += endInferenceTime - startInferenceTime;
    ++numInferences;

    const panelUpdateMilliseconds = 1000;
    if (endInferenceTime - lastPanelUpdate >= panelUpdateMilliseconds) {
        const averageInferenceTime = inferenceTimeSum / numInferences;
        inferenceTimeSum = 0;
        numInferences = 0;
        stats.customFpsPanel.update(
            1000.0 / averageInferenceTime, 120 /* maxValue */);
        lastPanelUpdate = endInferenceTime;
    }
}

async function renderResult() {
    if (camera.webcam.readyState < 2) {
        await new Promise((resolve) => {
            camera.webcam.onloadeddata = () => {
                resolve(webcam);
            };
        });
    }

    canvasVideo.getContext('2d').drawImage(video, 0, 0, canvasVideo.width, canvasVideo.height);
    // FPS only counts the time it takes to finish estimatePoses.
    beginEstimatePosesStats();

    webcamPoses = await detector.estimatePoses(camera.webcam, { flipHorizontal: true });

    endEstimatePosesStats();

    // get video poses array
    fetch(`./video/${jsFileName}.json`)
        .then((res) => {
            return res.json();
        })
        .then((bodySeq) => {

            // videoPoses = await detector2.estimatePoses(canvasVideo, { flipHorizontal: false });
            var frameNumber = Math.floor((video.currentTime / video.duration) * bodySeq.length)
            videoPoses = bodySeq[frameNumber];

            camera.drawCtx();

            // The null check makes sure the UI is not in the middle of changing to a
            // different model. If during model change, the result is from an old model,
            // which shouldn't be rendered.
            if (webcamPoses.length > 0 && !STATE.isModelChanged) {
                camera.drawResults(webcamPoses);
                if (video.paused) { videoFlag = false; }
                else { videoFlag = true; }
                if (videoFlag && videoPoses.length > 0) {
                    // save data
                    // videoPosesResult.push(videoPoses[0].keypoints3D);
                    // weightedDistance = poseSimilarity(videoPoses[0].keypoints3D.slice(BLAZEPOSE_CONFIG.indexStart,BLAZEPOSE_CONFIG.indexEnd),
                    //     webcamPoses[0].keypoints3D.slice(BLAZEPOSE_CONFIG.indexStart,BLAZEPOSE_CONFIG.indexEnd));

                    weightedDistance = poseSimilarity(
                        videoPoses.slice(BLAZEPOSE_CONFIG.indexStart,BLAZEPOSE_CONFIG.indexEnd),
                        webcamPoses[0].keypoints3D.slice(BLAZEPOSE_CONFIG.indexStart,BLAZEPOSE_CONFIG.indexEnd)
                    )
                    getScore(weightedDistance);
                    // console.log("score:", weightedDistance, myScore, maxScore);
                }
            }
        });
}

async function renderPrediction() {
    await renderResult();
    rafId = requestAnimationFrame(renderPrediction);
};

async function app() {

    stats = setupStats();
    // movenet -> blazepose
    detector = await poseDetection.createDetector(poseDetection.SupportedModels.BlazePose, BLAZEPOSE_CONFIG);
    // detector2 = await poseDetection.createDetector(poseDetection.SupportedModels.BlazePose, BLAZEPOSE_CONFIG);

    camera = await Camera.setupCamera(STATE.camera);

    await setBackendAndEnvFlags(STATE.flags, STATE.backend);

    renderPrediction();

};


function weightedDistanceMatching(vectorPose1XY, vectorPose2XY, vectorConfidences) {
    const summation1 = 1 / vectorConfidences[vectorConfidences.length - 1];
    var summation2 = 0;

    for (var i = 0; i < vectorPose1XY.length; i++) {
        var confIndex = Math.floor(i / 2);
        summation2 += vectorConfidences[confIndex] * Math.abs(vectorPose1XY[i] - vectorPose2XY[i]);
    }
    return summation1 * summation2;
}

function convertPoseToVector(pose) {
    var vectorPoseXY = [];

    var translateX = Number.POSITIVE_INFINITY;
    var translateY = Number.POSITIVE_INFINITY;
    var scaler = Number.NEGATIVE_INFINITY;

    var vectorScoresSum = 0;
    var vectorScores = [];

    // get weightOption if exists
    var mode = 'add'
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
            if ((scoreModifier || scoreModifier === 0) && typeof scoreModifier === 'number') {
                switch (mode) {
                    case 'multiply':
                        score *= scoreModifier;
                        break;
                    case 'replace':
                        score = scoreModifier;
                        break;
                    case 'add':
                        score += scoreModifier;
                        break;
                    default:
                        throw new Error("[Bad customWeight option] A mode must be specified and should be either 'multiply', 'replace' or 'add'");
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
        vectorScores
    ];
}

function scaleAndTranslate(vectorPoseXY, transformValues) {
    var transX = transformValues[0], transY = transformValues[1], scaler = transformValues[2];
    return vectorPoseXY.map(function (position, index) {
        return (index % 2 === 0 ?
            position / scaler - transX :
            position / scaler - transY);
    });
}

function L2Normalization(vectorPoseXY) {
    var absVectorPoseXY = 0;
    vectorPoseXY.forEach(function (position) {
        absVectorPoseXY += Math.pow(position, 2);
    });
    absVectorPoseXY = Math.sqrt(absVectorPoseXY);
    return vectorPoseXY.map(function (position) {
        return position / absVectorPoseXY; s
    });
}
function vectorizeAndNormalize(pose) {
    var _a = convertPoseToVector(pose);
    var vectorPoseXY = _a[0];
    var vectorPoseTransform = _a[1];
    var vectorPoseConfidences = _a[2];

    vectorPoseXY = scaleAndTranslate(vectorPoseXY, vectorPoseTransform);

    vectorPoseXY = L2Normalization(vectorPoseXY);

    return [vectorPoseXY, vectorPoseConfidences];
}

function poseSimilarity(pose1, pose2) {
    var _a = vectorizeAndNormalize(pose1)
    var vectorPose1XY = _a[0];
    var vectorPose1Scores = _a[1];

    var vectorPose2XY = vectorizeAndNormalize(pose2)[0];
    return weightedDistanceMatching(vectorPose1XY, vectorPose2XY, vectorPose1Scores);
}
app();