package models.authentication

import java.time.ZonedDateTime

import models.ModelType
import models.ModelType.ModelType
import models.common.Identifiable
import play.api.http.Writeable
import play.api.libs.json.{Json, OFormat}

case class Session(login: String, id: String, expiry: ZonedDateTime) extends Identifiable {
  def skipToken: Session = Session(login, "<secret>", expiry)
  def refreshed(newExpiry: ZonedDateTime): Session = Session(login, id, newExpiry)
}

object Session {

  final val browserLogin = "login"
  final val browserToken = "token"

  implicit val model: ModelType[Session] = ModelType.SESSION
  implicit val jsonFormat: OFormat[Session] = Json.format[Session]
  implicit val jsonWriteable: Writeable[Session] = Writeable.writeableOf_JsValue.map[Session](Json.toJson _)
}