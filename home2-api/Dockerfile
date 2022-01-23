FROM rust:1.57-slim as rust

WORKDIR /build
RUN cargo install cargo-chef
RUN cargo install cargo-run-script

# Separate stage for dependency planner. This ensures arbitrary changes to
# the code do not invalidate the dependencies. Only changes to the dependency
# json will invalidate the `chef prepare` layer below.
FROM rust as deps-plan

COPY . .
RUN cargo chef prepare --recipe-path deps.json

FROM rust as test

# Prebuild dependencies into their own layer cache
COPY --from=deps-plan /build/deps.json deps.json
RUN cargo chef cook --recipe-path deps.json

COPY . .
RUN cargo run-script test:unit

FROM rust as build

# Prebuild dependencies into their own layer cache
COPY --from=deps-plan /build/deps.json deps.json
RUN cargo chef cook --release --recipe-path deps.json

COPY . .
RUN cargo run-script build:release

FROM gcr.io/distroless/cc-debian11

COPY --from=build /build/target/release/home2-api /app

ENTRYPOINT ["/app"]
CMD []