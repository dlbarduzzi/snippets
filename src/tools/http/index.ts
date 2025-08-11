const statusCodes = {
  ok: 200,
  created: 201,
  badRequest: 400,
  unauthorized: 401,
  forbidden: 403,
  notFound: 404,
  unprocessableEntity: 422,
  internalServerError: 500,
} as const

type StatusCode = typeof statusCodes[keyof typeof statusCodes]

const _statusTexts = {
  ok: "Ok",
  created: "Created",
  badRequest: "Bad Request",
  unauthorized: "Unauthorized",
  forbidden: "Forbidden",
  notFound: "Not Found",
  unprocessableEntity: "Unprocessable Entity",
  internalServerError: "Internal Server Error",
} as const

type StatusText = typeof _statusTexts[keyof typeof _statusTexts]

function getStatusText(code: StatusCode): StatusText | undefined {
  switch (code) {
    case statusCodes.ok:
      return "Ok"
    case statusCodes.created:
      return "Created"
    case statusCodes.badRequest:
      return "Bad Request"
    case statusCodes.unauthorized:
      return "Unauthorized"
    case statusCodes.forbidden:
      return "Forbidden"
    case statusCodes.notFound:
      return "Not Found"
    case statusCodes.unprocessableEntity:
      return "Unprocessable Entity"
    case statusCodes.internalServerError:
      return "Internal Server Error"
    default:
      code satisfies never
  }
}

function toStatusText(code: StatusCode) {
  const value = getStatusText(code)
  if (value === undefined) {
    throw new Error(`Invalid status code: ${code}`)
  }
  return value
}

const http = {
  StatusOk: statusCodes.ok,
  StatusCreated: statusCodes.created,
  StatusBadRequest: statusCodes.badRequest,
  StatusUnauthorized: statusCodes.unauthorized,
  StatusForbidden: statusCodes.forbidden,
  StatusNotFound: statusCodes.notFound,
  StatusUnprocessableEntity: statusCodes.unprocessableEntity,
  StatusInternalServerError: statusCodes.internalServerError,
  StatusText: (code: StatusCode) => toStatusText(code),
}

export { http, type StatusCode, type StatusText }
