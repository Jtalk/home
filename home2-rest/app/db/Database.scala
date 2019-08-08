package db

import javax.inject.{Inject, Singleton}
import models.ModelType.ModelType
import play.api.Logger
import play.api.libs.json._
import play.api.mvc.{AbstractController, ControllerComponents}
import play.modules.reactivemongo.MongoController.JsGridFS
import play.modules.reactivemongo.{MongoController, ReactiveMongoApi, ReactiveMongoComponents}
import reactivemongo.api.{Cursor, ReadConcern}
import reactivemongo.api.commands.WriteResult
import reactivemongo.core.errors.GenericDatabaseException
import reactivemongo.play.json.JsObjectDocumentWriter
import reactivemongo.play.json.collection.JSONCollection
import utils.Extension._
import utils.JsonUtils

import scala.concurrent.{ExecutionContext, Future}

@Singleton
class Database @Inject()(cc: ControllerComponents, val reactiveMongoApi: ReactiveMongoApi)
  extends AbstractController(cc) with MongoController with ReactiveMongoComponents {

  val log = Logger(this.getClass)

  // Data processing
  def collection[T](implicit executionContext: ExecutionContext, mt: ModelType[T]): Future[JSONCollection]
    = database.map(_.collection[JSONCollection](mt.tableName))

  def findSingle[T](implicit ec: ExecutionContext, mt: ModelType[T], reads: Reads[T]): Future[Option[T]] = findSingleJs
    .map(JsonUtils.asObj[T])

  def updateSingle[T](entity: T)(implicit ec: ExecutionContext, mt: ModelType[T], writes: Writes[T]): Future[Unit] = {
    val obj = Json.toJson(entity).asInstanceOf[JsObject]
    val id = findExistingSingleId.map(_.getOrElse(JsString("-1")))
    val result = id.flatMap({ id =>
      collection.flatMap(_.update(JsObject(Seq("_id" -> id)), obj, upsert = true))
    })
    result.flatMap(asFuture)
  }

  private def findAllQuery[T](implicit ec: ExecutionContext, mt: ModelType[T]) = collection.map(_.find(Json.obj(), None))
  private def findSingleJs[T](implicit ec: ExecutionContext, mt: ModelType[T]) = collection.flatMap(_.find(Json.obj(), None).one[JsObject])
  private def findExistingSingleId[T](implicit ec: ExecutionContext, mt: ModelType[T]) = findSingleJs[T].map(_.map(json => (json \ "_id").get))
  private def enrichSingleObjectId[T](to: JsObject)(implicit ec: ExecutionContext, mt: ModelType[T]): Future[JsObject] = findExistingSingleId[T].fomap(id => to + ("_id" -> id)).foget(to)
  private def asFuture(result: WriteResult): Future[Unit] = Some(result)
    .filter(!_.ok)
    .map(WriteResult.Message.unapply)
    .map(m => GenericDatabaseException(m.getOrElse("unknown"), None))
    .map(Future.failed)
    .getOrElse(Future.unit)

  // File processing
  def findFilesMetadata(page: Int, pageSize: Int)(implicit ec: ExecutionContext): Future[Seq[JsObject]] = reactiveMongoApi.asyncGridFS.flatMap(filesMeta(_, page, pageSize))
  def countFiles()(implicit ec: ExecutionContext): Future[Long] = reactiveMongoApi.asyncGridFS.flatMap(countFiles)
  private def filesMeta(api: JsGridFS, page: Int, pageSize: Int)(implicit ec: ExecutionContext) = api.files
    .find(Json.obj(), None)
    .skip(page * pageSize)
    .cursor[JsObject]()
    .collect[Seq](pageSize, Cursor.FailOnError())
  private def countFiles(api: JsGridFS)(implicit ec: ExecutionContext) = api.files
    .count(None, None, 0, None, ReadConcern.Local)
}
