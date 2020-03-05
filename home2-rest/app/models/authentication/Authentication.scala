package models.authentication

import models.ModelType
import models.ModelType.ModelType
import models.authentication.AuthenticationType.AuthenticationType
import models.common.Identifiable
import play.api.Logger
import play.api.http.Writeable
import play.api.libs.json.{Json, OWrites, Reads, Writes}
import utils.security.PasswordType
import utils.security.PasswordType.PasswordType

object AuthenticationType extends Enumeration {
  type AuthenticationType = Value
  val Login, OAuth2 = Value

  implicit val reads: Reads[AuthenticationType] = Reads.enumNameReads(AuthenticationType)
  implicit val writes: Writes[AuthenticationType] = Writes.enumNameWrites[AuthenticationType.type]
}

case class Authentication(id: String, `type`: AuthenticationType, login: Option[Login]) extends Identifiable {
  def withLogin(login: Login): Authentication = Authentication(id, AuthenticationType.Login, Some(login))
}

case class Login(login: String, hash: String, passwordType: PasswordType) {
  def check(password: String): Boolean = passwordType.checker.check(password, hash)
  def withPassword(newPassword: String, newPasswordType: PasswordType): Login = Login.fromPassword(login, newPassword, newPasswordType)
}

private class AlwaysFailLogin extends Login(null, "$", PasswordType.PBKDF2WithHmacSHA512) {
  // Trying to simulate the same approximate timing with a non-existent login
  override def check(password: String): Boolean = {
    super.check("ignore-supplied-password")
    false
  }
}

object Login {
  lazy val alwaysFail: Login = new AlwaysFailLogin()

  def fromPassword(login: String, password: String, passwordType: PasswordType): Login = new Login(login, passwordType.hasher.hash(password), passwordType)

  implicit val jsonReads: Reads[Login] = Json.reads[Login]
  implicit val jsonWrites: OWrites[Login] = Json.writes[Login]
}

object Authentication {
  private[authentication] lazy final val log = Logger("Authentication")

  implicit val model: ModelType[Authentication] = ModelType.AUTHENTICATION
  implicit val jsonReads: Reads[Authentication] = Json.reads[Authentication]
  implicit val jsonWrites: OWrites[Authentication] = Json.writes[Authentication]
  implicit val jsonWriteable: Writeable[Authentication] = Writeable.writeableOf_JsValue.map[Authentication](Json.toJson _)
}
