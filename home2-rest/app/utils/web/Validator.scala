package utils.web

import play.api.libs.json.{JsPath, JsonValidationError}

object Validator {

  type JsError = Seq[JsErrorEntry]
  type JsErrorEntry = (JsPath, Seq[JsonValidationError])
}