package models.project

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

case class Project(title: String, id: String, description: String, logoId: String, published: Boolean, links: Seq[ProjectLink]) extends Identifiable {
}
object Project {

  implicit val model: ModelType[Project] = ModelType.PROJECT
  implicit val jsonWriter: Writes[Project] = Json.writes[Project]
  implicit val jsonWriteable: Writeable[Project] = Writeable.writeableOf_JsValue.map[Project](Json.toJson _)
  implicit val jsonReader: Reads[Project] = (
    (JsPath \ "title").read(minLength[String](1)) and
      (JsPath \ "id").read(minLength[String](1)) and
      (JsPath \ "description").read(minLength[String](1)) and
      (JsPath \ "logoId").read[String] and
      (JsPath \ "published").read[Boolean] and
      (JsPath \ "links").read[Seq[ProjectLink]])
    .apply(Project.apply _)


  implicit def jsonParser(implicit bodyParsers: PlayBodyParsers, ec: ExecutionContext) = WebUtils.bodyParser[Project]

}