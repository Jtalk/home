package db

import javax.inject.{Inject, Singleton}
import models.owner.ModelType.ModelType
import play.api.libs.json.{JsValue, Json, Reads}
import play.api.mvc.{AbstractController, ControllerComponents}
import play.modules.reactivemongo.{MongoController, ReactiveMongoApi, ReactiveMongoComponents}
import reactivemongo.play.json.JsObjectDocumentWriter
import reactivemongo.play.json.collection.JSONCollection
import utils.JsonUtils

import scala.concurrent.{ExecutionContext, Future}

@Singleton
class Database @Inject()(cc: ControllerComponents, val reactiveMongoApi: ReactiveMongoApi)
  extends AbstractController(cc) with MongoController with ReactiveMongoComponents {

  def collection[T](implicit executionContext: ExecutionContext, mt: ModelType[T]): Future[JSONCollection]
    = database.map(_.collection[JSONCollection](mt.tableName))

  def findSingle[T](implicit ec: ExecutionContext, mt: ModelType[T], reads: Reads[T]): Future[Option[T]] = findAllQuery[T]
    .flatMap(_.one[JsValue])
    .map(JsonUtils.asObj[T])

  private def findAllQuery[T](implicit ec: ExecutionContext, mt: ModelType[T]) = collection.map(_.find(Json.obj(), None))
}
