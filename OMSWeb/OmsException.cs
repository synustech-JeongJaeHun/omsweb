using System;
using System.Text;

namespace OMSWeb
{
  public class OmsException : Exception
  {
    public int Status { get; set; } = 500;
    
    public ErrorCodes Code { get; set; }
    public string Details { get; set; }
    public object Extra { get; set; }

    public OmsException(ErrorCodes code) : base(code.ToString())
    {
      this.Init(code);
    }

    public OmsException(ErrorCodes code, string message) : base(message)
    {
      this.Init(code);
    }

    public OmsException(ErrorCodes code, Exception ex) : base(code.ToString(), ex)
    {
      this.Init(code);
      this.Details = ex.Message;
    }

    private void Init(ErrorCodes code)
    {
      this.Code = code;
      this.PrintDebug();
    }

    private void PrintDebug()
    {
      this.Details = this.StackTrace;
      Debug(string.Format("[OMS Exception] {0} : {1}", this.Code, this.Message));
    }

    [System.Diagnostics.Conditional("DEBUG")]
    public static void Debug(string message)
    {
      StringBuilder sb = new StringBuilder();
      sb.AppendFormat("@@@ Debug Info : {0}\n", message);
      for (int i = 1; ; i++)
      {
        System.Diagnostics.StackFrame sf = new System.Diagnostics.StackFrame(i, true);
        string method = sf.GetMethod().Name;
        string file = sf.GetFileName();
        if (string.IsNullOrEmpty(file)) break;
        int line = sf.GetFileLineNumber();

        sb.AppendFormat("	- {0} : {1} : {2}\n", file, method, line);
      }
    }
  }
}
