namespace OMSWeb.Models
{
    public class FireStationFilters
    {
        public bool Enabled { get; set; }
        public string[] StartWords { get; set; }
        public string[] EndWords { get; set; }
        public string[] IncludeWords { get; set; }
        
        public void InitializeValues()
        {
            Enabled = true;
            StartWords = new string[] { "FE_" };
            EndWords =  new string[] { "" };
            IncludeWords =  new string[] { "" };
        }
    }
}