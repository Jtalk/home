package db

import controllers.common.PaginatedResult
import javax.inject.{Inject, Singleton}
import models.ModelType.ModelType
import models.common.Identifiable
import models.common.Pagination.fromTotalCount
import play.api.Logger
import play.api.libs.json.Json.obj
import play.api.libs.json._
import play.api.mvc.{AbstractController, ControllerComponents}
import play.modules.reactivemongo.{MongoController, ReactiveMongoApi, ReactiveMongoComponents}
import reactivemongo.api.collections.GenericCollection
import reactivemongo.api.commands.WriteResult
import reactivemongo.api.{Cursor, ReadConcern}
import reactivemongo.core.errors.GenericDatabaseException
import reactivemongo.play.json.collection.JSONCollection
import reactivemongo.play.json.{JSONSerializationPack, JsObjectDocumentWriter}
import utils.Extension._

import scala.collection.TraversableLike
import scala.collection.generic.CanBuildFrom
import scala.concurrent.{ExecutionContext, Future}

@Singleton
class Database @Inject()(cc: ControllerComponents, val reactiveMongoApi: ReactiveMongoApi)
  extends AbstractController(cc) with MongoController with ReactiveMongoComponents {

  final val log = Logger(this.getClass)
  private val MAX_ALL_ITEMS = 1024;

  // Data processing
  def collection[T](implicit executionContext: ExecutionContext, mt: ModelType[T]): Future[JSONCollection]
    = database.map(_.collection[JSONCollection](mt.tableName))

  def find[T](id: String)(implicit ec: ExecutionContext, mt: ModelType[T], reads: Reads[T]): Future[Option[T]] = findWith(obj("id" -> id))

  def findAll[T](filter: JsObject = obj())(implicit ec: ExecutionContext, mt: ModelType[T], reads: Reads[T]): Future[Seq[T]] =  collection
    .flatMap(_.find(filter, None)
      .cursor[T]()
      .collect[Seq](MAX_ALL_ITEMS, Cursor.FailOnError()))

  def findPage[T](page: Int, pageSize: Int, filter: JsObject = obj())(implicit ec: ExecutionContext, mt: ModelType[T], reads: Reads[T]): Future[PaginatedResult[T]] = collection
    .flatMap(_.find(filter, None)
      .skip(page * pageSize)
      .cursor[T]()
      .collect[Seq](pageSize, Cursor.FailOnError()))
    .zip(count)
    .map((pair => PaginatedResult(fromTotalCount(pair._2, pageSize, page), pair._1)))

  def findSingle[T](implicit ec: ExecutionContext, mt: ModelType[T], reads: Reads[T]): Future[Option[T]] = collection
    .flatMap(_.find(obj(), None).one[T])

  def findMerged[T, R <: TraversableLike[V, R], V](fetcher: T => R)
                                                         (implicit ec: ExecutionContext,
                                                          mt: ModelType[T],
                                                          readsT: Reads[T],
                                                          readsR: Reads[R],
                                                          canBuildFrom: CanBuildFrom[R, V, R]
                                                         ): Future[R] = collection
    .flatMap(_.find(obj(), None)
      .cursor[T]()
      .fold(canBuildFrom.apply().result())(_ ++ fetcher(_)))

  def update[T <: Identifiable](id: String, entity: T)(implicit ec: ExecutionContext,
                                                       mt: ModelType[T],
                                                       reads: Reads[T],
                                                       writes: OWrites[T]): Future[T] = updateAndLoad(obj("id" -> id), obj("id" -> entity.id), entity)

  def updateSingle[T](entity: T)(implicit ec: ExecutionContext, mt: ModelType[T], reads: Reads[T], writes: OWrites[T]): Future[T] = findExistingSingleId
    .map(_.get)
    .flatMap(id => updateAndLoad(obj("_id" -> id), obj("_id" -> id), entity))

  def delete[T](id: String)(implicit ec: ExecutionContext, mt: ModelType[T]): Future[Unit] = collection.map(_.delete())
    .flatMap(_.one(obj("id" -> id)))
    .flatMap(asFuture)

  def count[T](implicit ec: ExecutionContext, mt: ModelType[T]): Future[Long] = collection
    .flatMap(_.count(None, None, 0, None, ReadConcern.Majority))

  private def findExistingSingleId[T](implicit ec: ExecutionContext, mt: ModelType[T]) = collection
    .flatMap(_.find(obj(), Some(obj("_id" -> true))).one[JsObject])
    .fomap(_ \ "_id")
    .fomap(_.get)
  private def asFuture(result: WriteResult): Future[Unit] = Some(result)
    .filter(!_.ok)
    .map(WriteResult.Message.unapply)
    .map(m => GenericDatabaseException(m.getOrElse("unknown"), None))
    .map(Future.failed)
    .getOrElse(Future.unit)
  def findWith[T](selector: JsObject)(implicit ec: ExecutionContext, mt: ModelType[T], reads: Reads[T]): Future[Option[T]] = collection
    .flatMap(_.find(selector, None).one)
  private def updateAndLoad[T](updateSelector: JsObject, loadSelector: JsObject, entity: T)(implicit ec: ExecutionContext,
                                                                              mt: ModelType[T],
                                                                              reads: Reads[T],
                                                                              writes: OWrites[T]) = collection
    .map(_.update(false))
    .flatMap(_.one(updateSelector, entity, upsert = true))
    .flatMap(asFuture)
    .flatMap(_ => findWith(loadSelector))
    .flatMap(o => o.map(v => Future(v))
      .getOrElse(Future.failed(new RuntimeException("We have just upserted the entry and now it does not exist..."))))

  // File processing
  def findFilesMetadataPage(page: Int, pageSize: Int)(implicit ec: ExecutionContext): Future[PaginatedResult[JsObject]] = reactiveMongoApi.asyncGridFS
    .flatMap(api => findPageFrom(api.files, obj("uploadDate" -> -1), page, pageSize)
    .zip(countFiles())
    .map(pair => PaginatedResult(fromTotalCount(pair._2, pageSize, page), pair._1)))
  def findFileMetadata(id: JsValue)(implicit ec: ExecutionContext): Future[Option[JsObject]] = reactiveMongoApi.asyncGridFS
    .flatMap(_.files
      .find(obj("_id" -> id), None)
      .one)
  def countFiles()(implicit ec: ExecutionContext): Future[Long] = reactiveMongoApi.asyncGridFS
    .flatMap(_.files.count(None, None, 0, None, ReadConcern.Majority))

  // Shared
  private def findPageFrom(coll: GenericCollection[JSONSerializationPack.type], sort: JsObject, page: Int, pageSize: Int)(implicit ec: ExecutionContext) = coll
    .find(obj(), None)
    .sort(sort)
    .skip(page * pageSize)
    .cursor[JsObject]()
    .collect[Seq](pageSize, Cursor.FailOnError())
}
