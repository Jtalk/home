import {debug, getInput, getState, info, setFailed, setSecret} from "@actions/core";
import {GitHub, context} from "@actions/github";
import {execSync} from "child_process";

try {
    let {sha, ref} = context;
    if (ref && ref.startsWith("refs/heads/")) {
        ref = ref.substring(0, "refs/heads/".length);
    }
    if (ref && ref.startsWith("refs/tags/")) {
        ref = ref.substring(0, "refs/tags/".length);
    }
    let isMaster = ref === "master";
    let tagPrefix = getInput("tag-prefix", {required: true});
    let dockerfile = getInput("dockerfile");
    let registry = getInput("registry");
    let username = getInput("username");
    let password = getInput("password");
    let workingDir = getInput("working-dir");
    let push = ["yes", "true", "y", "1"].includes(getInput("push") || "true");
    setSecret(password);

    let tag = withRegistry(registry, `${tagPrefix}:${sha}`);
    let refTag = ref && withRegistry(registry, `${tagPrefix}:${refTag}`);
    let latestTag = withRegistry(registry, `${tagPrefix}:latest`);
    dockerfile = `${workingDir}/${dockerfile}`;

    info("Logging into the registry " + registry);
    docker.login(registry, username, password);
    info(`Building from ${dockerfile} to ${tag}`);
    docker.build(workingDir, dockerfile, tag);
    if (push) {
        info(`Pushing tag ${tag}`);
        docker.push(tag);
        if (ref) {
            docker.tag(tag, refTag);
            info(`Ref '${ref}' build, pushing tag ${refTag}`);
            docker.push(refTag);
        }
        if (isMaster) {
            docker.tag(tag, latestTag);
            info(`Master branch build, pushing tag ${latestTag}`);
            docker.push(latestTag);
        }
    } else {
        info("Skipping push");
    }
    info("Done");
} catch (e) {
    console.error("Error running action docker-build-push", e);
    setFailed(e.message);
}

function withRegistry(registry, tag) {
    if (registry) {
        return `${registry}/${tag}`;
    } else {
        return tag;
    }
}

const docker = {
    processConfig: {
        stdio: "inherit",
        encoding: "utf8",
    },
    login: (registry = "", username, password) => {
        if (!username && !password) {
            info("Login skipped: no username/password provided");
            return;
        }
        let output = execSync(`docker login -u '${username}' --password-stdin ${registry}`, {
            input: password,
            ...this.processConfig
        });
        debug(output);
    },
    build: (workingDir, dockerfile, tag) => {
        let dockerfileOpt = dockerfile && `-f '${dockerfile}'`;
        let output = execSync(`docker build ${dockerfileOpt} -t '${tag}' ${workingDir}`, this.processConfig);
        debug(output);
    },
    tag: (from, to) => {
        let output = execSync(`docker tag '${from}' '${to}'`, this.processConfig);
        debug(output);
    },
    push: (tag) => {
        let output = execSync(`docker push '${tag}'`, this.processConfig);
        debug(output);
    },
}