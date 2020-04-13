package utils

import akka.stream.Materializer
import play.api.libs.json.{JsValue, Reads}
import play.api.libs.streams.Accumulator
import play.api.mvc.{MultipartFormData, PlayBodyParsers}
import play.modules.reactivemongo.MongoController.{JsFileToSave, JsGridFS, JsGridFSBodyParser, JsReadFile}
import play.modules.reactivemongo.PlaySupport

import scala.concurrent.{ExecutionContext, Future}

object ReactiveMongoFixes {

  /**
    * I'm done with Scala implicits' idiosyncrasies & reactivemongo's exploding APIs.
    * I've spent a few hours trying to figure it out how a method call can possibly
    * be ambiguous with all the implicits explicitly provided, but I wasn't successful.
    * I asked around but they don't seem to be selling this kind of absinthe here in London.
    */
  def myVeryOwnGridFSBodyParser[Id <: JsValue](gfs: Future[JsGridFS], fileToSave: (String, Option[String]) => JsFileToSave[Id])
                                              (implicit readFileReader: Reads[JsReadFile[Id]], materializer: Materializer, parse: PlayBodyParsers): JsGridFSBodyParser[Id] = {
    implicit def ec: ExecutionContext = materializer.executionContext

    parse.multipartFormData {
      case PlaySupport.FileInfo(partName, filename, contentType) =>
        Accumulator.flatten(gfs.map { gridFS =>
          val fileRef = fileToSave(filename, contentType)
          val sink = GridFSStreams(gridFS).sinkWithMD5(fileRef)

          Accumulator(sink).map { ref =>
            MultipartFormData.FilePart(partName, filename, contentType, ref)
          }
        })
    }
  }

}