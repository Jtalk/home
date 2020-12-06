package models.blog

import java.time.{ZoneOffset, ZonedDateTime}
import java.util.UUID

import models.ModelType
import models.ModelType.ModelType
import models.common.Identifiable
import models.search.Searchable
import play.api.http.Writeable
import play.api.libs.functional.syntax._
import play.api.libs.json.Reads._
import play.api.libs.json._
import play.api.mvc._
import utils.WebUtils

import scala.concurrent.ExecutionContext

case class Article(title: String,
                   id: String,
                   published: Boolean,
                   created: ZonedDateTime,
                   updated: ZonedDateTime,
                   content: String,
                   tags: Set[String],
                   atomId: UUID,
                  ) extends Identifiable with Searchable {
}
object Article {

  implicit val model: ModelType[Article] = ModelType.ARTICLE
  implicit val jsonWriter: OWrites[Article] = Json.writes[Article]
  implicit val jsonWriteable: Writeable[Article] = Writeable.writeableOf_JsValue.map[Article](Json.toJson _)
  implicit val jsonReader: Reads[Article] = (
    (JsPath \ "title").read(minLength[String](1)) and
      (JsPath \ "id").read(minLength[String](1)) and
      (JsPath \ "published").readWithDefault[Boolean](false) and
      (JsPath \ "created").readWithDefault[ZonedDateTime](ZonedDateTime.now(ZoneOffset.UTC)) and
      (JsPath \ "updated").readWithDefault[ZonedDateTime](ZonedDateTime.now(ZoneOffset.UTC)) and
      (JsPath \ "content").readWithDefault[String]("")and
      (JsPath \ "tags").readWithDefault[Set[String]](Set[String]()) and
      (JsPath \ "atomId").readWithDefault[UUID](UUID.randomUUID()))
    .apply(Article.apply _)

  implicit def jsonParser(implicit bodyParsers: PlayBodyParsers, ec: ExecutionContext) = WebUtils.bodyParser[Article]
}
