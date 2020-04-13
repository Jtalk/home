name := """home2"""
organization := "com.example"

version := "1.0-SNAPSHOT"

lazy val root = (project in file(".")).enablePlugins(PlayScala)

scalaVersion := "2.12.11"

libraryDependencies += guice
libraryDependencies += "org.reactivemongo" %% "play2-reactivemongo" % "0.18.3-play27"

libraryDependencies += "org.scalatestplus.play" %% "scalatestplus-play" % "3.1.2" % Test
