# Pose Estimation & Pose similarity


## Download and Installation

To begin using, choose one of the following options to get started:

* Clone the repo: `git clone https://github.com/wonderit/pose-estimation-similarity.git`
* [Fork, Clone, or Download on GitHub](https://github.com/wonderit/pose-estimation-similarity)

## Files

###  JS files (/js)
* detection.js : poseSimilarity, 자세 일치도 Score 계산
* params.js - BLAZEPOSE_CONFIG : indexStart, indexEnd로 자세일치도 계산할 keypoint 설정
* index.html, playboardX.html : tfjs로 로딩할 모델은 script tag로 호출
  ```
    <script src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-core"></script>
    <script src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-converter"></script>
    <script src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-backend-webgl"></script>
    <script src="https://cdn.jsdelivr.net/npm/@tensorflow-models/pose-detection"></script>
  ```
### JSON, video mp4 files (/video)
* #c.json : detection.js에서 원본 영상의 pose정보를 미리 JSON에서 불러와서 입력 영상의 pose와 일치도를 분석함. 
  * json파일 경로는 video파일명 기준으로 불러옴 e.g. : `video/1c.mp4#t=0.1` -> `video/1c.json`

### BlazePose
![BlazePose Keypoints](https://storage.googleapis.com/mediapipe/blazepose-keypoints-updated.png)

0: nose  \
1: left_eye_inner \
2: left_eye  \
3: left_eye_outer  \
4: right_eye_inner  \
5: right_eye  \
6: right_eye_outer  \
7: left_ear  \
8: right_ear  \
9: mouth_left  \
10: mouth_right  \
11: left_shoulder  \
12: right_shoulder  \
13: left_elbow  \
14: right_elbow  \
15: left_wrist  \
16: right_wrist  \
17: left_pinky  \
18: right_pinky  \
19: left_index  \
20: right_index  \
21: left_thumb  \
22: right_thumb  \
23: left_hip  \
24: right_hip  \
25: left_knee  \
26: right_knee  \
27: left_ankle  \
28: right_ankle  \
29: left_heel  \
30: right_heel  \
31: left_foot_index  \
32: right_foot_index  

## Usage

After installation, run `npm install` and then run `npm start` which will open up a preview of the template in your default browser.

## Skill stack
![skill-stack](https://user-images.githubusercontent.com/58676931/152530139-d24bace9-f6f2-49b7-b0ba-a0a5d77fb90f.jpg)

## Demo Capture

### Playboard
![playboard](https://user-images.githubusercontent.com/58676931/152529533-b5d3eb8b-d02e-40c5-8372-f988a0d91924.jpg)
## Template Copyright and License

Copyright 2013-2021 Start Bootstrap LLC. Code released under the [MIT](https://github.com/StartBootstrap/startbootstrap-resume/blob/master/LICENSE) license.
