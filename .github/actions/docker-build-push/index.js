const core = require("@actions/core");
const github = require("@actions/github");
const proc = require("child_process");

function withRegistry(registry, tag) {
    if (registry) {
        return `${registry}/${tag}`;
    } else {
        return tag;
    }
}

function asBoolean(str) {
    return str && ["yes", "true", "y", "1"].includes(str);
}

function tryPush(tag, orElse) {
    try {
        docker.push(tag);
    } catch (e) {
        core.debug("Error while pushing image: " + e.message);
        orElse();
    }
}

const processConfig = {
    stdio: "inherit",
    encoding: "utf8",
};
    
const docker = {
    login: (registry = "", username, password) => {
        if (!username && !password) {
            core.info("Login skipped: no username/password provided");
            return;
        }
        let output = proc.execSync(`docker login -u '${username}' --password-stdin ${registry}`,
            Object.assign({}, processConfig, {input: password, stdio: "pipe"}));
        core.debug(output);
    },
    build: (workingDir, dockerfile, tag) => {
        let dockerfileOpt = dockerfile && `-f '${dockerfile}'`;
        let output = proc.execSync(`docker build ${dockerfileOpt} -t '${tag}' ${workingDir}`, processConfig);
        core.debug(output);
    },
    tag: (from, to) => {
        let output = proc.execSync(`docker tag '${from}' '${to}'`, processConfig);
        core.debug(output);
    },
    pull: (tag) => {
        let output = proc.execSync(`docker pull '${tag}'`, processConfig);
        core.debug(output);
    },
    push: (tag) => {
        let output = proc.execSync(`docker push '${tag}'`, processConfig);
        core.debug(output);
    },
}

try {
    let {sha, ref} = github.context;
    if (ref && ref.startsWith("refs/heads/")) {
        ref = ref.substring("refs/heads/".length);
    }
    if (ref && ref.startsWith("refs/tags/")) {
        ref = ref.substring("refs/tags/".length);
    }
    let isMaster = ref === "master";
    let tagPrefix = core.getInput("tag-prefix", {required: true});
    let dockerfile = core.getInput("dockerfile");
    let registry = core.getInput("registry");
    let username = core.getInput("username");
    let password = core.getInput("password");
    let workingDir = core.getInput("working-directory");
    let build = asBoolean(core.getInput("build") || "true");
    let push = asBoolean(core.getInput("push") || "true");
    core.setSecret(password);

    let tag = withRegistry(registry, `${tagPrefix}:${sha}`);
    let refTag = ref && withRegistry(registry, `${tagPrefix}:${ref}`);
    let latestTag = withRegistry(registry, `${tagPrefix}:latest`);
    dockerfile = `${workingDir}/${dockerfile}`;

    core.info("Logging into the registry " + registry);
    docker.login(registry, username, password);
    if (build) {
        core.info(`Building from ${dockerfile} to ${tag}`);
        docker.build(workingDir, dockerfile, tag);
    } else {
        core.info("Skipping build as configured");
    }
    if (push) {
        core.info(`Pushing tag ${tag}`);
        if (build) {
            // Don't fall back to pull if we know we've just built the image
            docker.push(tag);
        } else {
            // If we were asked to skip the build phase, there might already be
            // an image available in this container. Or there might be none,
            // in which case we'd want to pull it before applying branch/master tags.
            tryPush(tag, () => docker.pull(tag));
        }
        if (ref) {
            docker.tag(tag, refTag);
            core.info(`Ref '${ref}' build, pushing tag ${refTag}`);
            docker.push(refTag);
        }
        if (isMaster) {
            docker.tag(tag, latestTag);
            core.info(`Master branch build, pushing tag ${latestTag}`);
            docker.push(latestTag);
        }
    } else {
        core.info("Skipping push as configured");
    }
    core.info("Done");
} catch (e) {
    console.error("Error running action docker-build-push", e);
    core.setFailed(e.message);
}
