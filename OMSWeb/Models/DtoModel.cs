using System.ComponentModel.DataAnnotations;

namespace OMSWeb.Models
{
  public class TokenResponse
  {
    public string Token { get; set; }
  }

  public class LoginFormDto
  {
    [Required]
    public string Email { get; set; }
    [Required]
    public string Password { get; set; }
  }

  public class ProfileFormDto
  {
    [Required]
    public string Email { get; set; }
    [Required]
    public string FirstName { get; set; }
    [Required]
    public string LastName { get; set; }
    public string Password { get; set; }
  }
}