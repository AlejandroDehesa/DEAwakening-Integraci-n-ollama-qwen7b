export function sendSuccess(res, data = null, status = 200) {
  return res.status(status).json({
    success: true,
    data,
    error: null
  });
}

export function sendError(res, status, error) {
  return res.status(status).json({
    success: false,
    data: null,
    error
  });
}
