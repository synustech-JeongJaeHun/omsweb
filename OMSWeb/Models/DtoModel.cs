using System.ComponentModel.DataAnnotations;

namespace OMSWeb.Models
{
  public class TokenResponse
  {
    public string Token { get; set; }
  }

  public class SimpleResponse<T>
  {
    public T Data { get; set; }
  }

  public class LoginFormDto
  {
    [Required]
    public string UserId { get; set; }
    [Required]
    public string Password { get; set; }
  }

  public class ProfileFormDto
  {
    [EmailAddress]
    public string Email { get; set; }
    [Required]
    public string FirstName { get; set; }
    [Required]
    public string LastName { get; set; }
    public string Password { get; set; }
  }

  public class AccountFormDto : ProfileFormDto
  {
    [Required]
    public string Id { get; set; }
    public bool? IsNew { get; set; }
  }

  public class RoleFormDto
  {
    [Required]
    public int Id { get; set; }
    [Required]
    public string Name { get; set; }
    [Required]
    public int[] Permissions { get; set; }
  }

  public class PointUpdateDto {
    public int? Group { get; set; }
    public bool? IsHome { get; set; }
  }

  public class BufferUpdateDto {
    public string Note { get; set; }
  }
}