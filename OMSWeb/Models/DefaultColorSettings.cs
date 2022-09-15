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

    #region chjs visual start
    public string? DisconnectModeVehicleColor { get; set; }
    public string? ErrorModeVehicleColor { get; set; }
    public string? MaintenanceModeVehicleColor { get; set; }
    public string? ManualModeVehicleColor { get; set; }
    public string? IdleModeVehicleColor { get; set; }
    public string? HomeIvrModeVehicleColor { get; set; }
    public string? RunningModeVehicleColor { get; set; }
    public string? ZcuBlockedVehicleColor { get; set; }
    public string? SensorStoppedVehicleColor { get; set; }
    #endregion

    public string? CargoLoadingColor { get; set; }
    public string? CargoFullColor { get; set; }
    public string? CargoUnloadingColor { get; set; }
    public string? FireshutterClosedColor { get; set; }
    public string? FireshutterOpenedColor { get; set; }
    public string? MtlUnuseColor { get; set; }
    public string? MtlUseColor { get; set; }
  }
}