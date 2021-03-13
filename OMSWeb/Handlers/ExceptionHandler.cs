using Microsoft.AspNetCore.Builder;
using OMSWeb.Middlewares;

namespace OMSWeb.Handlers
{
  public static class ExceptionHandler
  {
    public static void UseOmsExceptionHandler(this IApplicationBuilder application)
    {
      application.UseMiddleware<ExceptionMiddleware>();
    }
  }
}