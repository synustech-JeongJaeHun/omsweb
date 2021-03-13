using System;
using System.Diagnostics;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Infrastructure;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using Microsoft.Extensions.Options;
using OMSWeb.Models;

namespace OMSWeb.Handlers {
  public class OmsProblemDetailsFactory : ProblemDetailsFactory
  {
    private readonly ApiBehaviorOptions _options;

    public OmsProblemDetailsFactory(IOptions<ApiBehaviorOptions> options)
    {
      _options = options?.Value ??
        throw new ArgumentNullException(nameof(options));
    }

    public override ProblemDetails CreateProblemDetails(HttpContext httpContext, int? statusCode = null, string title = null, string type = null, string detail = null, string instance = null)
    {
      statusCode ??= 500;
      ProblemDetails problemDetails = null;

      var context = httpContext.Features.Get<IExceptionHandlerFeature>();

      if (context?.Error != null)
      {
        if (context.Error is OmsException ex)
        {
          statusCode = 400;
          // httpContext.Response.StatusCode = statusCode.Value;

          problemDetails = new ProblemDetails
          {
            Status = statusCode,
            Detail = ex.Message,
            Instance = instance,
            Extensions = { 
              { "extra", ex.Extra },
              { "result", ex.Code }
            }
          };
        }
      }

      if (problemDetails == null)
      {
        //	default exception handler
        problemDetails = new ProblemDetails
        {
          Status = statusCode,
          Title = title,
          Type = type,
          Detail = detail,
          Instance = instance,
        };
      }

      ApplyProblemDetailsDefaults(httpContext, problemDetails, statusCode.Value);

      return problemDetails;
    }

    public override ValidationProblemDetails CreateValidationProblemDetails(HttpContext httpContext, ModelStateDictionary modelStateDictionary, int? statusCode = null, string title = null, string type = null, string detail = null, string instance = null)
    {
      if (modelStateDictionary == null)
      {
        throw new ArgumentNullException(nameof(modelStateDictionary));
      }

      statusCode ??= 400;

      var problemDetails = new ValidationProblemDetails(modelStateDictionary)
      {
        Status = statusCode,
        // Type = type,
        Detail = detail,
        // Instance = instance,
        Extensions = {
          {"result", ErrorCodes.BadRequestModel},
          {"message", "요청데이터가 유효하지 않습니다."},
        }
      };

      if (title != null)
      {
        // For validation problem details, don't overwrite the default title with null.
        problemDetails.Title = title;
      }

      ApplyProblemDetailsDefaults(httpContext, problemDetails, statusCode.Value);

      return problemDetails;
    }

    private void ApplyProblemDetailsDefaults(HttpContext httpContext, ProblemDetails problemDetails, int statusCode)
    {
      //problemDetails.Status ??= statusCode;
      problemDetails.Status = problemDetails.Status ?? statusCode;

      if (_options.ClientErrorMapping.TryGetValue(statusCode, out var clientErrorData))
      {
        problemDetails.Title ??= clientErrorData.Title;
        problemDetails.Type ??= clientErrorData.Link;
      }

      var traceId = Activity.Current?.Id ?? httpContext?.TraceIdentifier;
      if (traceId != null)
      {
        problemDetails.Extensions["traceId"] = traceId;
      }
    }
  }

}