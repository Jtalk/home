package controllers

import akka.stream.Materializer
import db.Database
import javax.inject._
import models.common.Pagination
import play.api.Configuration
import play.api.libs.json._
import play.api.mvc._
import play.modules.reactivemongo.MongoController.{JsGridFS, JsGridFSBodyParser, JsReadFile}
import play.modules.reactivemongo._
import reactivemongo.play.json._
import utils.Extension._
import utils.ReactiveMongoFixes

import scala.concurrent.{ExecutionContext, Future}

@Singleton
class ImageController @Inject()(config: Configuration,
                                cc: ControllerComponents,
                                materializer: Materializer,
                                api: ReactiveMongoApi,
                                database: Database)
  extends AbstractController(cc) with MongoController with ReactiveMongoComponents {

  private implicit def ec: ExecutionContext = cc.executionContext
  private implicit def parsers: PlayBodyParsers = controllerComponents.parsers
  private implicit def m: Materializer = materializer
  override implicit def reactiveMongoApi: ReactiveMongoApi = api
  import MongoController.readFileReads

  def upload(description: String) = Action.async(parseFile(description)) { request => request.body.files.head.ref.id |> uploaded }
  def serveFile(id: String) = Action.async { _ => reactiveMongoApi.asyncGridFS.flatMap(api => serveById(id, api)) }
  def deleteFile(id: String) = Action.async { _ => reactiveMongoApi.asyncGridFS.flatMap(api => deleteById(id, api)).map(_ => Ok) }
  def listFiles(page: Int) = Action.async { _ => findAllWithPagination(page).map(Ok.apply[JsValue]) }

  private def uploaded(id: JsValue) = findOne(id).fomap(Ok.apply[JsObject]).map(_.getOrElse(InternalServerError("Cannot find image just uploaded")))
  private def serveById(id: String, gfs: JsGridFS)
  = serve[JsValue, JsReadFile[JsValue]](gfs)(gfs.find(Json.obj("_id" -> id)), dispositionMode = CONTENT_DISPOSITION_INLINE)
  private def deleteById(id: String, gfs: JsGridFS)= gfs.remove(JsString(id))

  private def parseFile(description: String): JsGridFSBodyParser[JsValue] = ReactiveMongoFixes.myVeryOwnGridFSBodyParser(
    reactiveMongoApi.asyncGridFS,
    (name: String, contentType: Option[String]) => JSONFileToSave(
      Some(name),
      contentType,
      metadata = fileMeta(description),
      uploadDate = Some(System.currentTimeMillis())))

  private def fileMeta(description: String): JsObject = Json.obj(
    "description" -> description
  )

  private def filterPrivateMeta(in: JsObject) = in.fields
    .filter(f => publicMetadataFields.contains(f._1))
    .map(f => (publicMetadataFields(f._1), f._2)) |> JsObject
  private def findAll(page: Int): Future[JsArray] = database
    .findFilesMetadata(page, pageSize)
    .map(_.map(filterPrivateMeta))
    .map(JsArray.apply)
  private def findOne(id: JsValue): Future[Option[JsObject]] = database.findFileMetadata(id).fomap(filterPrivateMeta)
  private def findAllWithPagination(page: Int): Future[JsObject] = findAll(page)
    .zip(database.countFiles())
    .map(pair => Json.obj("data" -> pair._1, "pagination" -> Pagination.jsonWriter.writes(toPagination(pair._2, pageSize, page))))
  private def toPagination(totalCount: Long, pageSize: Int, currentPage: Int) = Pagination(
    total = Math.ceil(totalCount / pageSize).toInt,
    current = currentPage,
    pageSize = pageSize)
  private def pageSize = config.get[Int]("app.images.page.size")
  private def publicMetadataFields = Map(
    "metadata" -> "metadata",
    "uploadDate" -> "uploaded",
    "filename" -> "filename",
    "_id" -> "id")
}
