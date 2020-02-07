package db

import javax.inject.{Inject, Singleton}
import models.ModelType.ModelType
import models.common.Identifiable
import play.api.Logger
import play.api.libs.json._
import play.api.mvc.{AbstractController, ControllerComponents}
import play.modules.reactivemongo.MongoController.JsGridFS
import play.modules.reactivemongo.{MongoController, ReactiveMongoApi, ReactiveMongoComponents}
import reactivemongo.api.commands.WriteResult
import reactivemongo.api.{Cursor, ReadConcern}
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
  private val MAX_ALL_ITEMS = 1024;

  // Data processing
  def collection[T](implicit executionContext: ExecutionContext, mt: ModelType[T]): Future[JSONCollection]
    = database.map(_.collection[JSONCollection](mt.tableName))

  def find[T](id: String)(implicit ec: ExecutionContext, mt: ModelType[T], reads: Reads[T]): Future[Option[T]] = findJs(id)
    .map(JsonUtils.asObj[T])

  def findAll[T](implicit ec: ExecutionContext, mt: ModelType[T], reads: Reads[T]): Future[Seq[T]] = findAllJs
    .fmap((v: JsValue) => Json.fromJson[T](v)
      .asEither
      .left.map(errs => log.error("Cannot deserialise JSON" + errs))
      .toOption
      .get
    )

  def findSingle[T](implicit ec: ExecutionContext, mt: ModelType[T], reads: Reads[T]): Future[Option[T]] = findSingleJs
    .map(JsonUtils.asObj[T])

  def update[T <: Identifiable](id: String, entity: T)(implicit ec: ExecutionContext, mt: ModelType[T], reads: Reads[T], writes: Writes[T]) = {
    val obj = Json.toJson(entity).asInstanceOf[JsObject]
    collection.map(_.update(false))
      .flatMap(_.one(Json.obj("id" -> id), obj, upsert = true))
      .flatMap(asFuture)
      .flatMap(_ => find[T](entity.id))
      .flatMap(o => o.map(v => Future(v))
        .getOrElse(Future.failed[T](new RuntimeException("We have just upserted the entry and now it does not exist..."))))
  }

  def updateSingle[T](entity: T)(implicit ec: ExecutionContext, mt: ModelType[T], reads: Reads[T], writes: Writes[T]): Future[T] = {
    val obj = Json.toJson(entity).asInstanceOf[JsObject]
    findExistingSingleId.map(_.getOrElse(JsString("-1")))
      .flatMap(id => collection.flatMap(_.update(false).one(Json.obj("_id" -> id), obj, upsert = true)))
      .flatMap(asFuture)
      .flatMap(_ => findSingle[T])
      .flatMap(o => o.map(v => Future(v))
        .getOrElse(Future.failed[T](new RuntimeException("We have just upserted the entry and now it does not exist..."))))
  }

  def delete[T](id: String)(implicit ec: ExecutionContext, mt: ModelType[T]) = collection.map(_.delete())
    .flatMap(_.one(Json.obj("id" -> id)))
    .flatMap(asFuture)

  private def findAllJs[T](implicit ec: ExecutionContext, mt: ModelType[T]) = collection.flatMap(_.find(Json.obj(), None).cursor[JsObject]().collect[Seq](MAX_ALL_ITEMS, Cursor.FailOnError()))
  private def findJs[T](id: String)(implicit ec: ExecutionContext, mt: ModelType[T]) = collection.flatMap(_.find(Json.obj("id" -> id), None).one[JsObject])
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
  def findFileMetadata(id: JsValue)(implicit ec: ExecutionContext): Future[Option[JsObject]] = reactiveMongoApi.asyncGridFS.flatMap(fileMeta(_, id))
  def countFiles()(implicit ec: ExecutionContext): Future[Long] = reactiveMongoApi.asyncGridFS.flatMap(countFiles)
  private def filesMeta(api: JsGridFS, page: Int, pageSize: Int)(implicit ec: ExecutionContext) = api.files
    .find(Json.obj(), None)
    .sort(Json.obj("uploadDate" -> -1))
    .skip(page * pageSize)
    .cursor[JsObject]()
    .collect[Seq](pageSize, Cursor.FailOnError())
  private def fileMeta(api: JsGridFS, id: JsValue)(implicit ec: ExecutionContext) = api.files
    .find(Json.obj("_id" -> id), None)
    .one[JsObject]
  private def countFiles(api: JsGridFS)(implicit ec: ExecutionContext) = api.files
    .count(None, None, 0, None, ReadConcern.Local)
}
