namespace OMSWeb.Models
{

    public enum RET_CODE : byte
    {
        Failed = 0,
        Success = 1,
    }

    public class QueryResult
    {
        public int Retcode { get; set; }
        public string Message { get; set; }
    }
}