package controllers

import akka.stream.Materializer
import javax.inject._
import play.api.libs.json.{JsObject, JsValue, Json}
import play.api.mvc._
import play.modules.reactivemongo.MongoController.{JsGridFS, JsReadFile}
import play.modules.reactivemongo.{MongoController, ReactiveMongoApi, ReactiveMongoComponents}
import reactivemongo.play.json._
import utils.Extension.PipeOp

import scala.concurrent.ExecutionContext

@Singleton
class ImageController @Inject()(cc: ControllerComponents, materializer: Materializer, api: ReactiveMongoApi)
  extends AbstractController(cc) with MongoController with ReactiveMongoComponents {

  private implicit def ec: ExecutionContext = cc.executionContext
  private implicit def parsers: PlayBodyParsers = controllerComponents.parsers
  private implicit def m: Materializer = materializer
  override implicit def reactiveMongoApi: ReactiveMongoApi = api
  import MongoController.readFileReads
  private def bodyParser = gridFSBodyParser(reactiveMongoApi.asyncGridFS)

  def upload = Action(bodyParser) { request => request.body.files.head.ref.id |> uploaded |> Created.apply[JsObject] }

  def serveFile(id: String) = Action.async { request => reactiveMongoApi.asyncGridFS.flatMap(api => serveById(id, api)) }

  private def uploaded(id: JsValue) = Json.obj("status" -> "ok", "id" -> id)
  private def serveById(id: String, gfs: JsGridFS)
  = serve[JsValue, JsReadFile[JsValue]](gfs)(gfs.find(Json.obj("_id" -> id)), dispositionMode = CONTENT_DISPOSITION_INLINE)
}
