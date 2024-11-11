using System;
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
      
    [Required]
    public string UserId { get; set; }
    
    [Required]
    public string Email { get; set; }
    [Required]
    public string FirstName { get; set; }
    
    public string LastName { get; set; }
    
    public string NewPassword { get; set; }
  }

  public class AccountFormDto : LoginFormDto
  {
    public string Email { get; set; }
    public string FirstName { get; set; }
    public string LastName { get; set; }
    [Required]
    public string Id { get; set; }
    public bool? IsNew { get; set; }

    public int[] Roles { get; set; }
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

  public class SegmentUpdateDto
  {
    public int segment_id { get; set; }
    public bool? isDisabled { get; set; }
  }

  public class PointUpdateDto
  {
    public int? Group { get; set; }
    public bool? IsHome { get; set; }
  }

  public class BufferUpdateDto
  {
    public string Note { get; set; }
  }

  public class ZcuUpdateDto
  {
    public int ZcuType { get; set; }
  }

  public class AnnotationDto
  {
    public int ReferenceID { get; set; }
    public string ReferenceTable { get; set; }
    public string ModifiedBy { get; set; }
    public string Annotation { get; set; }
    public int VehicleAlaramID { get; set; }
  }

  public class ModuleStatusDto
  {
    public int ID { get; set; }
    public int PID { get; set; }

  }
}