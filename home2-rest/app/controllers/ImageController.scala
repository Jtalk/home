package controllers

import java.time.Clock

import akka.stream.Materializer
import controllers.common.{Authenticating, PaginatedResult}
import db.Database
import javax.inject._
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
class ImageController @Inject()(val config: Configuration,
                                cc: ControllerComponents,
                                materializer: Materializer,
                                api: ReactiveMongoApi,
                                val clock: Clock,
                                val db: Database)
  extends AbstractController(cc) with MongoController with ReactiveMongoComponents with Authenticating {

  private implicit def ec: ExecutionContext = cc.executionContext
  private implicit def parsers: PlayBodyParsers = controllerComponents.parsers
  private implicit def m: Materializer = materializer
  override implicit def reactiveMongoApi: ReactiveMongoApi = api
  import MongoController.readFileReads

  def upload(description: String) = AuthenticatedAction.async(parseFile(description)) { _ => request => request.body.files.head.ref.id |> uploaded }
  def serveFile(id: String) = Action.async { _ => reactiveMongoApi.asyncGridFS.flatMap(api => serveById(id, api)) }
  def deleteFile(id: String) = AuthenticatedAction.async { _ => _ => reactiveMongoApi.asyncGridFS.flatMap(api => deleteById(id, api)).map(_ => Ok) }
  def listFiles(page: Int) = AuthenticatedAction.async { _ => _ => findAllWithPagination(page).map(Ok[PaginatedResult[JsObject]]) }

  private def uploaded(id: JsValue) = findOne(id).fomap(Ok[JsObject]).map(_.getOrElse(InternalServerError("Cannot find image just uploaded")))
  private def serveById(id: String, gfs: JsGridFS)
  = serve[JsValue, JsReadFile[JsValue]](gfs)(gfs.find(Json.obj("_id" -> id)), dispositionMode = CONTENT_DISPOSITION_INLINE)
    .map(withoutContentLength)
    .map(_.withHeaders(CACHE_CONTROL -> "public; max-age=604800"))
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

  private def findOne(id: JsValue): Future[Option[JsObject]] = db.findFileMetadata(id)
    .fomap(filterPrivateMeta)
  private def findAllWithPagination[T](page: Int): Future[PaginatedResult[JsObject]] = db.findFilesMetadataPage(page, pageSize)
    .map(pr => PaginatedResult(pr.pagination, pr.data.map(filterPrivateMeta)))
  private def filterPrivateMeta(in: JsObject) = in.fields
    .filter(f => publicMetadataFields.contains(f._1))
    .map(f => (publicMetadataFields(f._1), f._2)) |> JsObject

  private def withoutContentLength(result: Result): Result = result.copy(
    header = result.header.copy(
      headers = result.header.headers.filterKeys(_ != CONTENT_LENGTH)))

  private lazy val pageSize = config.get[Int]("app.images.page.size")
  private def publicMetadataFields = Map(
    "metadata" -> "metadata",
    "uploadDate" -> "uploaded",
    "filename" -> "filename",
    "_id" -> "id")
}
