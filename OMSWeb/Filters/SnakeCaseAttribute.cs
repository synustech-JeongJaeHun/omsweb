using System;
using System.Buffers;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.AspNetCore.Mvc.Formatters;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using Newtonsoft.Json.Serialization;

namespace OMSWeb.Filters
{
  [AttributeUsage(AttributeTargets.Class | AttributeTargets.Method)]
  public class SnakeCaseAttribute : ActionFilterAttribute
  {
    public override void OnActionExecuted(ActionExecutedContext context)
    {
      if (context.Result is ObjectResult result)
      {
        result.Formatters.Add(new NewtonsoftJsonOutputFormatter(
          new Newtonsoft.Json.JsonSerializerSettings
          {
            ContractResolver = new DefaultContractResolver
            {
              NamingStrategy = new SnakeCaseNamingStrategy()
            }
          },
          context.HttpContext.RequestServices.GetRequiredService<ArrayPool<char>>(),
          context.HttpContext.RequestServices.GetRequiredService<IOptions<MvcOptions>>().Value
        ));
      }
      base.OnActionExecuted(context);
    }
  }
}