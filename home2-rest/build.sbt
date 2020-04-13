name := """home2"""
organization := "com.example"

version := "1.0-SNAPSHOT"

lazy val root = (project in file(".")).enablePlugins(PlayScala)

scalaVersion := "2.12.11"

libraryDependencies += guice
libraryDependencies += "org.reactivemongo" %% "play2-reactivemongo" % "0.20.3-play27"

libraryDependencies += "com.beachape" %% "enumeratum" % "1.5.15"
libraryDependencies += "com.beachape" %% "enumeratum-play-json" % "1.5.17"
libraryDependencies += "com.beachape" %% "enumeratum-play" % "1.5.17"

libraryDependencies += "org.scalatestplus.play" %% "scalatestplus-play" % "3.1.2" % Test
