using Newtonsoft.Json;
using Newtonsoft.Json.Converters;
using Newtonsoft.Json.Serialization;

namespace OMSWeb.Models
{
  public class ErrorDetails
  {
    // public int StatusCode { get; set; }
    [JsonConverter(typeof(StringEnumConverter))]
    public ErrorCodes Result { get; set; }
    public string Message { get; set; }
    public string Details { get; set; }
    public object Extra { get; set; }

    public ErrorDetails()
    {
      // this.StatusCode = (int)HttpStatusCode.InternalServerError;
      this.Message = "Server Error";
      this.Result = ErrorCodes.ServerError;
    }
    public ErrorDetails(OmsException exception) : this()
    {
      this.Message = exception.Message;
      this.Result = exception.Code;
      this.Details = exception.Details;
      this.Extra = exception.Extra;
    }

    public override string ToString()
    {
      return JsonConvert.SerializeObject(this, new JsonSerializerSettings()
      {
        // ContractResolver = new CamelCasePropertyNamesContractResolver()
        ContractResolver = new DefaultContractResolver { NamingStrategy = new SnakeCaseNamingStrategy() }
      });
    }
  }

}