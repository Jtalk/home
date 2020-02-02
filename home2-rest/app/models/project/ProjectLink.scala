package models.project

import play.api.libs.json.{Json, Reads, Writes}

case class ProjectLink(name: String, href: String) {
}
object ProjectLink {
  implicit val jsonWriter: Writes[ProjectLink] = Json.writes[ProjectLink]
  implicit val jsonReader: Reads[ProjectLink] = Json.reads[ProjectLink]
}