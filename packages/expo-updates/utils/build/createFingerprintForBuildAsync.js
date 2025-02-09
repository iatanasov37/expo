"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFingerprintForBuildAsync = void 0;
const config_1 = require("@expo/config");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const createFingerprintAsync_1 = require("./createFingerprintAsync");
async function createFingerprintForBuildAsync(platform, possibleProjectRoot, destinationDir) {
    // Remove projectRoot validation when we no longer support React Native <= 62
    let projectRoot;
    if (fs_1.default.existsSync(path_1.default.join(possibleProjectRoot, 'package.json'))) {
        projectRoot = possibleProjectRoot;
    }
    else if (fs_1.default.existsSync(path_1.default.join(possibleProjectRoot, '..', 'package.json'))) {
        projectRoot = path_1.default.resolve(possibleProjectRoot, '..');
    }
    else {
        throw new Error('Error loading app package. Ensure there is a package.json in your app.');
    }
    process.chdir(projectRoot);
    const { exp: config } = (0, config_1.getConfig)(projectRoot, {
        isPublicConfig: true,
        skipSDKVersionRequirement: true,
    });
    const runtimeVersion = config[platform]?.runtimeVersion ?? config.runtimeVersion;
    if (!runtimeVersion || typeof runtimeVersion === 'string') {
        return;
    }
    if (runtimeVersion.policy !== 'fingerprintExperimental') {
        // not a policy that needs fingerprinting
        return;
    }
    const fingerprint = await (0, createFingerprintAsync_1.createFingerprintAsync)(projectRoot, platform);
    console.log(JSON.stringify(fingerprint.sources));
    fs_1.default.writeFileSync(path_1.default.join(destinationDir, 'fingerprint'), fingerprint.hash);
}
exports.createFingerprintForBuildAsync = createFingerprintForBuildAsync;
