namespace OMSWeb.Models
{

    public enum MCS_HCACK : byte
    {
        AlreadyConfirmed = 0,
        CommandNotExist = 1,
        NotAbleToExcute = 2,
        ParameterInvalid = 3,
        Confirm = 4,
        Reject = 5,
        ObjectNotExist = 6,
        TypeMismatch = 10
    }

    public enum SourceType : byte
    {
        NONE,
        STATION,
        BUFFER,
        VEHICLE
    }

    public enum DestType : byte
    {
        NONE,
        STATION,
        BUFFER
    }


    public class TransferHCACK
    {
        public int HCACK { get; set; }
        public string CPNAME { get; set; }
        public int CPACK { get; set; }
    }
}