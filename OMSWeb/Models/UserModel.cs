namespace OMSWeb.Models {
  public class UserCertificate {
    public string Id { get; set; }
    public string UserId { get; set; }
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public string Email { get; set; }
    public int[] Roles { get; set; }
    public int[] Permissions { get; set; }
  } 

  
}