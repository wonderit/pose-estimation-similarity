/**
 * @license
 * Copyright 2021 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */
//import * as posedetection from '@tensorflow-models/pose-detection';
import { isiOS } from './util.js';

export const DEFAULT_LINE_WIDTH = 2;
export const DEFAULT_RADIUS = 4;

export const VIDEO_SIZE = {
  '640 X 480': { width: 640, height: 480 },
  '640 X 360': { width: 640, height: 360 },
  // '360 X 270': { width: 360, height: 270 }
  '360 X 270': { width: 423, height: 238 }
};
export const STATE = {
  camera: { targetFPS: 60, sizeOption: '640 X 480' },
  backend: 'tfjs-webgl',
  flags: {},
  modelConfig: {},
  MoveNet: "MoveNet",
  BlazePose: "BlazePose"
};
export const BLAZEPOSE_CONFIG = {
  maxPoses: 1,
  scoreThreshold: 0.65,
  runtime: 'tfjs',
  enableSmoothing: true,
  modelType: 'full', //lite, full, heavy
  indexStart: 11,
  indexEnd: 33
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
export const POSE_WEIGHT_FOR_EXERCISE_1 = [
  5, 5, 5, 5, 5, 5,
  5, 5, 5, 5, 5, 5,
  5, 5, 5, 5, 5, 5,
  5, 5, 5, 5,
]

export const POSE_WEIGHT_FOR_EXERCISE_2 = [
  1, 1, 1, 1, 1, 1,
  1, 1, 1, 1, 1, 1,
  3, 3, 3, 3, 3, 3,
  10, 10, 10, 10,
]


export const POSE_WEIGHT_FOR_EXERCISE_knee =  [
  0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0,
  10, 10, 10, 10, 10, 10,
  10, 10, 10, 10,
]
export const POSE_WEIGHT_FOR_EXERCISE_knee2 =  [
  1, 1, 1, 1, 1, 1,
  1, 1, 1, 1, 1, 1,
  5, 5, 5, 5, 5, 5,
  5, 5, 5, 5,
]

// 능동외전 (좌)
export const POSE_WEIGHT_FOR_EXERCISE_arm_l =  [
  10, 1, 10, 1, 10, 1,
  10, 1, 10, 1, 10, 1,
  1, 1, 1, 1, 1, 1,
  1, 1, 1, 1,
]
// 능동외전 우
export const POSE_WEIGHT_FOR_EXERCISE_arm_r =  [
  1, 10, 1, 10, 1, 10,
  1, 10, 1, 10, 1, 10,
  1, 1, 1, 1, 1, 1,
  1, 1, 1, 1,
]

// 무릎굴곡신전
export const POSE_WEIGHT_FOR_EXERCISE_KNEE_1 =  [
  1, 1, 1, 1, 1, 1,
  1, 1, 1, 1, 1, 1,
  5, 10, 5, 10, 5, 10,
  5, 5, 5, 5,
]

// squat
export const POSE_WEIGHT_FOR_EXERCISE_SQUAT =  [
  1, 1, 1, 1, 1, 1,
  1, 1, 1, 1, 1, 1,
  10, 10, 10, 10, 10, 10,
  5, 5, 5, 5,
]

//능동 전방 굴곡
export const SCORE_ARRAY_ARM_1 = [0.035, 0.055, 0.08]

//능동외전, 능동전방굴곡
export const SCORE_ARRAY_ARM_2 = [0.045, 0.07, 0.13]

// 무릎굴곡신전
export const SCORE_ARRAY_KNEE_1 = [0.05, 0.1, 0.15]

// squat
export const SCORE_ARRAY_KNEE_2 = [0.03, 0.06, 0.09]

/**
 * This map descripes tunable flags and theior corresponding types.
 *
 * The flags (keys) in the map satisfy the following two conditions:
 * - Is tunable. For example, `IS_BROWSER` and `IS_CHROME` is not tunable,
 * because they are fixed when running the scripts.
 * - Does not depend on other flags when registering in `ENV.registerFlag()`.
 * This rule aims to make the list streamlined, and, since there are
 * dependencies between flags, only modifying an independent flag without
 * modifying its dependents may cause inconsistency.
 * (`WEBGL_RENDER_FLOAT32_CAPABLE` is an exception, because only exposing
 * `WEBGL_FORCE_F16_TEXTURES` may confuse users.)
 */
export const TUNABLE_FLAG_VALUE_RANGE_MAP = {
  WEBGL_VERSION: [1, 2],
  WASM_HAS_SIMD_SUPPORT: [true, false],
  WASM_HAS_MULTITHREAD_SUPPORT: [true, false],
  WEBGL_CPU_FORWARD: [true, false],
  WEBGL_PACK: [true, false],
  WEBGL_FORCE_F16_TEXTURES: [true, false],
  WEBGL_RENDER_FLOAT32_CAPABLE: [true, false],
  WEBGL_FLUSH_THRESHOLD: [-1, 0, 0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2],
  CHECK_COMPUTATION_FOR_ERRORS: [true, false],
};

export const BACKEND_FLAGS_MAP = {
  ['tfjs-wasm']: ['WASM_HAS_SIMD_SUPPORT', 'WASM_HAS_MULTITHREAD_SUPPORT'],
  ['tfjs-webgl']: [
    'WEBGL_VERSION', 'WEBGL_CPU_FORWARD', 'WEBGL_PACK',
    'WEBGL_FORCE_F16_TEXTURES', 'WEBGL_RENDER_FLOAT32_CAPABLE',
    'WEBGL_FLUSH_THRESHOLD'
  ],
  ['mediapipe-gpu']: []
};

export const MODEL_BACKEND_MAP = {
  [poseDetection.SupportedModels.PoseNet]: ['tfjs-webgl'],
  [poseDetection.SupportedModels.MoveNet]: ['tfjs-webgl', 'tfjs-wasm'],
  [poseDetection.SupportedModels.BlazePose]:
    isiOS() ? ['tfjs-webgl'] : ['mediapipe-gpu', 'tfjs-webgl']
}

export const TUNABLE_FLAG_NAME_MAP = {
  PROD: 'production mode',
  WEBGL_VERSION: 'webgl version',
  WASM_HAS_SIMD_SUPPORT: 'wasm SIMD',
  WASM_HAS_MULTITHREAD_SUPPORT: 'wasm multithread',
  WEBGL_CPU_FORWARD: 'cpu forward',
  WEBGL_PACK: 'webgl pack',
  WEBGL_FORCE_F16_TEXTURES: 'enforce float16',
  WEBGL_RENDER_FLOAT32_CAPABLE: 'enable float32',
  WEBGL_FLUSH_THRESHOLD: 'GL flush wait time(ms)'
};
