name := """home2-api"""
organization := "com.example"

version := "SNAPSHOT"

lazy val root = (project in file(".")).enablePlugins(PlayScala)

scalaVersion := "2.12.11"
javacOptions ++= Seq("-source", "8", "-target", "8")

libraryDependencies += guice
libraryDependencies += "org.reactivemongo" %% "play2-reactivemongo" % "0.20.3-play27"

libraryDependencies += "com.beachape" %% "enumeratum" % "1.5.15"
libraryDependencies += "com.beachape" %% "enumeratum-play-json" % "1.5.17"
libraryDependencies += "com.beachape" %% "enumeratum-play" % "1.5.17"

libraryDependencies += "org.scalatestplus.play" %% "scalatestplus-play" % "3.1.2" % Test

javaOptions in Universal ++= Seq(
  "-Dpidfile.path=/dev/null",
  "-J-XX:+PrintGCDateStamps", "-J-XX:+PrintGCDetails",
)

import com.typesafe.sbt.packager.docker.DockerChmodType
(packageName in Docker) := "jtalk/home-api"
(dockerBaseImage in Docker) := "azul/zulu-openjdk-alpine:8-jre"
(dockerExposedPorts in Docker) := Seq(8080)
(dockerEnvVars in Docker) := Map("HTTP_PORT" -> "8080")
(dockerChmodType in Docker) := DockerChmodType.UserGroupWriteExecute