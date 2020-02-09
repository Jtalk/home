package models.blog

import java.time.ZonedDateTime

import models.ModelType
import models.ModelType.ModelType
import models.common.Identifiable
import play.api.http.Writeable
import play.api.libs.functional.syntax._
import play.api.libs.json.Reads._
import play.api.libs.json._
import play.api.mvc._
import utils.WebUtils

import scala.concurrent.ExecutionContext

case class Article(title: String, id: String, published: Boolean, created: ZonedDateTime, content: String, tags: Seq[String]) extends Identifiable {
}
object Article {

  implicit val model: ModelType[Article] = ModelType.ARTICLE
  implicit val jsonWriter: OWrites[Article] = Json.writes[Article]
  implicit val jsonWriteable: Writeable[Article] = Writeable.writeableOf_JsValue.map[Article](Json.toJson _)
  implicit val jsonReader: Reads[Article] = (
    (JsPath \ "title").read(minLength[String](1)) and
      (JsPath \ "id").read(minLength[String](1)) and
      (JsPath \ "published").read[Boolean] and
      (JsPath \ "created").read[ZonedDateTime] and
      (JsPath \ "content").read[String] and
      (JsPath \ "tags").read[Seq[String]])
    .apply(Article.apply _)


  implicit def jsonParser(implicit bodyParsers: PlayBodyParsers, ec: ExecutionContext) = WebUtils.bodyParser[Article]

}