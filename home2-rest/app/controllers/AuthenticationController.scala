package controllers

import java.time.Clock
import java.util.UUID

import controllers.ResponseStatus.{error, ok}
import controllers.common.Authenticating
import db.Database
import javax.inject.{Inject, Singleton}
import models.authentication.Session.{browserLogin, browserToken}
import models.authentication.{Authentication, AuthenticationType, Login, Session}
import play.api.data.Forms._
import play.api.data.{Form, FormError}
import play.api.http.Writeable
import play.api.i18n.{Langs, Messages, MessagesApi, MessagesImpl}
import play.api.libs.json.Json.obj
import play.api.libs.json.{Json, OWrites}
import play.api.mvc._
import play.api.{Configuration, Logger}
import utils.Extension._
import utils.security.PasswordType
import utils.security.Randoms.newToken

import scala.concurrent.Future.successful
import scala.concurrent.{ExecutionContext, Future}

@Singleton
class AuthenticationController @Inject()(cc: ControllerComponents,
                                         implicit val db: Database,
                                         implicit val config: Configuration,
                                         implicit val clock: Clock,
                                         langs: Langs,
                                         messagesApi: MessagesApi)
  extends AbstractController(cc) with Authenticating {

  private lazy final val log = Logger(getClass)

  implicit private lazy val messages: Messages = MessagesImpl(langs.availables.head, messagesApi)

  implicit private def ec: ExecutionContext = cc.executionContext

  private val loginForm = Form(tuple("login" -> nonEmptyText, "password" -> nonEmptyText))
  private val changeUserForm = Form("password" -> nonEmptyText)

  def login(): Action[AnyContent] = Action.async { implicit request: Request[AnyContent] =>
    loginForm.bindFromRequest().fold(
      hasErrors => {
        log.error(s"Error parsing login form ${hasErrors.errors}")
        Future(BadRequest(Response(error, hasErrors.errors)).withNewSession)
      },
      { case (login, password) => doLogin(login, password)
        .fflatMap(_ => createSession(login))
        .fomap(s => success(s))
        .map(_.getOrElse(badRequest))
      })
  }

  def refresh(): Action[AnyContent] = AuthenticatedAction.async { (session, request) =>
    success(session)(request) |> successful
  }

  def logout(): Action[AnyContent] = AuthenticatedAction.async { (session, _) =>
    db.delete[Session](session.id)
      .map(_ => Ok)
  }

  def changeUser(userLogin: String): Action[AnyContent] = Action.async { req: Request[AnyContent] => //AuthenticatedAction.async { (_, req) =>
    implicit val request: Request[AnyContent] = req
    changeUserForm.bindFromRequest.fold(
      hasErrors => {
        log.error(s"Error parsing change user form ${hasErrors.errors}")
        Future(BadRequest(Response(error, hasErrors.errors)))
      },
      password => {
        val passwordType = PasswordType.PBKDF2WithHmacSHA512
        val newLogin = () => Login.fromPassword(userLogin, password, passwordType)
        findAuth(userLogin)
          .fomap(auth => auth.withLogin(
            auth.login
              .map(_.withPassword(password, passwordType))
              .getOrElse(newLogin())))
          .map(_.getOrElse(Authentication(UUID.randomUUID().toString, AuthenticationType.Login, Some(newLogin()))))
          .flatMap(db.update[Authentication])
          .map(_ => Ok)
      }
    )
  }

  private def doLogin(login: String, password: String) =
    findAuth(login)
      .fomap(_.login
        .withValue(_ => log.info(s"A Login object was found for login ${login}"))
        .withNone(log.error("Found a Login authentication without a login object inside"))
        .getOrElse(Login.alwaysFail))
      .fomap(_.check(password))
      .map(_.filter(identity))
      .map(_.withNone(log.error(s"Cannot authenticate login ${login}")))

  private def findAuth(login: String) = db.findWith[Authentication](obj("login.login" -> login, "type" -> AuthenticationType.Login))
  private def createSession(login: String): Future[Session] = Session(login, newToken(), expiry) |> db.update[Session]
  private def success[T](s: Session)(implicit r: Request[T]) = Ok(Response(ok)).addingToSession(browserLogin -> s.login, browserToken -> s.id)
  private def badRequest = BadRequest(Response(error, Seq("Incorrect login/password")))
}

object ResponseStatus extends Enumeration {
  type ResponseStatus = Value
  val ok, error = Value
}

import controllers.ResponseStatus._

case class Response private(status: ResponseStatus, errors: Seq[String]) {
}

object Response {

  def apply(status: ResponseStatus, errors: Seq[FormError])(implicit messages: Messages) = new Response(status, errors.map(_.format))

  def apply(status: ResponseStatus) = new Response(status, Seq())

  implicit val jsonWrites: OWrites[Response] = Json.writes[Response]
  implicit val jsonWriteable: Writeable[Response] = Writeable.writeableOf_JsValue.map[Response](Json.toJson _)
}