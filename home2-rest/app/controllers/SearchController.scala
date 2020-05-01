package controllers

import java.lang.Math.min

import db.Database
import javax.inject.{Inject, Singleton}
import models.ModelType.ModelType
import models.blog.Article
import models.owner.OwnerInfo
import models.project.Project
import models.search.{SearchResult, Searchable}
import play.api.http.Writeable
import play.api.libs.json.{JsObject, Json, OWrites, Reads}
import play.api.mvc._
import play.api.{Configuration, Logger}
import utils.Extension._

import scala.concurrent.{ExecutionContext, Future}

@Singleton
class SearchController @Inject()(cc: ControllerComponents,
                                 val db: Database,
                                 val config: Configuration)
  extends AbstractController(cc) {

  private final val log = Logger(this.getClass)
  private lazy val maxSearchResults = config.get[Int]("app.search.results.max")

  implicit private def ec: ExecutionContext = cc.executionContext
  implicit private def parsers: PlayBodyParsers = controllerComponents.parsers

  def search(query: String, maxResultsReq: Int): Action[AnyContent] = Action.async { implicit request: Request[AnyContent] =>
    if (maxResultsReq > maxSearchResults) {
      log.error(s"Too many search results were requested: requested ${maxResultsReq}, but max is ${maxSearchResults}")
    }
    val maxResults = min(maxResultsReq, maxSearchResults)
    val owner = searchFor[OwnerInfo](query, maxResults)
    val projects = searchFor[Project](query, maxResults) // FILTER BY PUBLISHED
    val blog = searchFor[Article](query, maxResults) // FILTER BY PUBLISHED
    val total = owner.flatMap(o => projects.flatMap(p => blog.map(_ ++ p ++ o)))
    total
      .map(_.sortBy(_("score").as[Float])(Ordering.Float.reverse))
      .map(_.take(maxResults))
      .map(Json.toJson[Seq[JsObject]])
      .map(Ok(_))
  }

  private def searchFor[T <: Searchable](query: String, max: Int)(implicit m: ModelType[T],
                                                    w: OWrites[SearchResult[T]],
                                                    r: Reads[SearchResult[T]]): Future[Seq[JsObject]]
  = db.search[T](query, max)
    .fmap(Json.toJsObject[SearchResult[T]])
}
