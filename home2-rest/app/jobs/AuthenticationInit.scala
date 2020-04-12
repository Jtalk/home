package jobs

import java.util.UUID

import db.Database
import javax.inject.Inject
import models.authentication.{Authentication, AuthenticationType, Login}
import play.api.{Configuration, Logger}
import utils.security.PasswordType

import scala.concurrent.{ExecutionContext, Future}
import scala.util.{Failure, Success}

class AuthenticationInit @Inject()(db: Database, config: Configuration, implicit val ec: ExecutionContext) {

  private final val log = Logger(this.getClass)

  if (isSetupMode) {
    db.findAll[Authentication]()
      .flatMap({
        case Seq() => createDefaultAuthentication()
          .map(_ => log.info("Successfully set up initial user credentials"))
        case _ => Future(log.info("Found existing authentication, skipping initial auth setup"))
      })
      .onComplete({
        case Success(_) => Unit
        case Failure(e) => log.error("Error while setting up initial authentication", e)
      })
  } else {
    log.info("Skipping setup mode: disabled")
  }

  private def isSetupMode: Boolean = config.get[Boolean]("app.setup.enabled")
  private def setupLogin: String = config.get[String]("app.setup.defaults.login")
  private def setupPassword: String = config.get[String]("app.setup.defaults.password")

  private def createDefaultAuthentication(): Future[Unit] = {
    val login = setupLogin
    val password = setupPassword
    if (login == null || login.isBlank || password == null || password.isBlank) {
      return Future.failed(new RuntimeException("Initial setup failed: either login and/or password was not provided"))
    }
    val auth = Authentication(
      UUID.randomUUID().toString,
      AuthenticationType.Login,
      Some(Login.fromPassword(login, setupPassword, PasswordType.PBKDF2WithHmacSHA512)))
    db.update(auth).map(_ => Unit)
  }

}
