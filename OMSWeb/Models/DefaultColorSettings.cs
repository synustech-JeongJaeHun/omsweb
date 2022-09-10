#nullable enable

namespace OMSWeb.Models
{
  public class DefaultColorSettings
  {
    public string? ColorSettingVersion { get; set; }
    public string? HomeBackgroundColor { get; set; }
    public string? PlaybackBackgroundColor { get; set; }
    public string? StationColor { get; set; }
    public string? StationDisabledColor { get; set; }
    public string? BufferColor { get; set; }
    public string? BufferDisabledColor { get; set; }
    public string? PointColor { get; set; }
    public string? NormalSegmentColor { get; set; }
    public string? DisabledSegmentColor { get; set; }
    public string? SegmentDirectionColor { get; set; }
    public string? AutoModeVehicleColor { get; set; }
    public string? ManualModeVehicleColor { get; set; }
    public string? NoneModeVehicleColor { get; set; }
    public string? CargoLoadingColor { get; set; }
    public string? CargoFullColor { get; set; }
    public string? CargoUnloadingColor { get; set; }
    public string? FireshutterClosedColor { get; set; }
    public string? FireshutterOpenedColor { get; set; }
    public string? MtlUnuseColor { get; set; }
    public string? MtlUseColor { get; set; }
  }
}