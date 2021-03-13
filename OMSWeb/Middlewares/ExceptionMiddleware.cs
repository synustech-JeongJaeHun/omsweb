using System;
using System.Net;
using System.Net.Mime;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using OMSWeb.Models;

namespace OMSWeb.Middlewares {

	public class ExceptionMiddleware
	{
		private readonly RequestDelegate _next;

		public ExceptionMiddleware(RequestDelegate next)
		{
			_next = next;
		}

		public async Task InvokeAsync(HttpContext httpContext)
		{
			try
			{
				await _next(httpContext);
			}
			catch (OmsException ex)
			{
				await HandleExceptionAsync(httpContext, ex);
			}
			catch (System.Exception ex)
			{
				await HandleExceptionAsync(httpContext, new OmsException(ErrorCodes.ServerError, ex));
			}
		}

		private static Task HandleExceptionAsync(HttpContext context, Exception ex)
		{
			if (!context.Response.HasStarted)
			{
				context.Response.ContentType = MediaTypeNames.Application.Json;
				context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;
			}

			return context.Response.WriteAsync(new ErrorDetails().ToString());
		}
		private static Task HandleExceptionAsync(HttpContext context, OmsException ex)
		{
			if (!context.Response.HasStarted)
			{
				context.Response.ContentType = MediaTypeNames.Application.Json;
				context.Response.StatusCode = ex.Status;
			}

			return context.Response.WriteAsync(new ErrorDetails(ex).ToString());
		}
	}
}