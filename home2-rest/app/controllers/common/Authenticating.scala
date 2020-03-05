package controllers.common

import java.time.{Clock, Instant}

import controllers.common.Results._
import db.Database
import models.authentication.Session
import models.authentication.Session.{browserLogin, browserToken}
import play.api.Configuration
import play.api.mvc._
import utils.Extension._

import scala.concurrent.Future.successful
import scala.concurrent.duration.Duration
import scala.concurrent.{ExecutionContext, Future}

trait Authenticating extends BaseController {

  implicit private val ec: ExecutionContext = controllerComponents.executionContext

  protected val config: Configuration
  protected val db: Database
  protected val clock: Clock

  protected final val sessionDuration = java.time.Duration.ofMillis(config.get[Duration]("app.session.timeout").toMillis)

  object AuthenticatedAction {

    def apply(block: (Session, Request[AnyContent]) => Result): Action[AnyContent] = async((s, r) => successful(block(s, r)))
    def apply[A](bp: BodyParser[A])(block: (Session, Request[A]) => Result): Action[A] = async[A](bp)((s, r) => successful(block(s, r)))
    def async(block: (Session, Request[AnyContent]) => Future[Result]): Action[AnyContent] = async[AnyContent](Action.parser)(block)
    def async[A](bp: BodyParser[A])(block: (Session, Request[A]) => Future[Result]): Action[A]
    = Action.async(bp)(implicit req => loadSession(req)
      .fomap(refresh)
      .flatMap(_.liftFuture)
      .map(_.flatten)
      .fomap(s => block(s, req).map(_.addingToSession(s)))
      .flatMap(_ getOrElse unauthorisedResponse))
  }

  protected def unauthorisedResponse[A]: Future[Result] = successful(Unauthorized("This endpoint requires authentication, use /login").withNewSession)
  protected def now: Instant = Instant.now(clock)
  protected def expiry: Instant = now plus sessionDuration

  protected def loadSession[A](req: Request[A]): Future[Option[Session]]
  = req.session.get(browserToken)
    .map(db.find[Session](_))
    .liftFuture
    .map(_.flatten)

  private def refresh(s: Session): Future[Option[Session]] = {
    if (s.expiry isBefore now) {
      db.delete[Session](s.id)
      successful(None)
    }
    else {
      val refreshedSession = s.refreshed(expiry)
      db.update(refreshedSession)
        .map(Some.apply)
    }
  }
}

object Results {

  implicit class ResultOps[T](val r: Result) extends AnyVal {
    def addingToSession(s: Session)(implicit req: Request[T]): Result = r.addingToSession(browserLogin -> s.login, browserToken -> s.id)
  }

}