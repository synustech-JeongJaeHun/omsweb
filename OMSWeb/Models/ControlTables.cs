#nullable enable

namespace OMSWeb.Models
{
    public class ControlTables
    {
       public bool orders {get;set;}
       public bool orders_id {get;set;}
       public bool orders_origin {get;set;}
       public bool orders_logicalId {get;set;}
       public bool orders_priority {get;set;}
       public bool orders_state {get;set;}
       public bool orders_vehicleId {get;set;}
       public bool orders_locationPickup {get;set;}
       public bool orders_locationPickupAlias {get;set;}
       public bool orders_locationDropoff {get;set;}
       public bool orders_locationDropoffAlias {get;set;}
       public bool orders_locationMove {get;set;}
       public bool orders_carrierLabel {get;set;}
       public bool orders_timeCreated {get;set;}
       public bool orders_timeAssigned {get;set;}
       public bool orders_lastReassignType {get;set;}
       public bool orders_durationTotal {get;set;}
       public bool orders_durationUnassigned {get;set;}
       public bool orders_durationPickup {get;set;}
       public bool orders_durationLoad {get;set;}
       public bool orders_durationDropoff {get;set;}
       public bool orders_durationUnload {get;set;}
       public bool orders_durationMove {get;set;}
       public bool orders_distancePickup {get;set;}
       public bool orders_distanceDropoff {get;set;}
       public bool orders_distanceMove {get;set;}
       public bool vehicles {get;set;}
       public bool vehicles_id {get;set;}
       public bool vehicles_logicalId {get;set;}
       public bool vehicles_connection {get;set;}
       public bool vehicles_railIn {get;set;}
       public bool vehicles_mode {get;set;}
       public bool vehicles_isMaint {get;set;}
       public bool vehicles_canBePushed {get;set;}
       public bool vehicles_hostOrder {get;set;}
       public bool vehicles_orderOrigin {get;set;}
       public bool vehicles_group {get;set;}
       public bool vehicles_curPoint {get;set;}
       public bool vehicles_commandPoint {get;set;}
       public bool vehicles_destPoint {get;set;}
       public bool vehicles_orderId {get;set;}
       public bool vehicles_locationPickup {get;set;}
       public bool vehicles_locationDropoff {get;set;}
       public bool vehicles_locationMove {get;set;}
       public bool vehicles_runtimeTotal {get;set;}
       public bool vehicles_movingState {get;set;}
       public bool vehicles_cargoState {get;set;}
       public bool vehicles_carrierLabel {get;set;}
       public bool vehicles_error {get;set;}
       public bool vehicles_sensorStopped {get;set;}
       public bool vehicles_blocked {get;set;}
       public bool vehicles_distanceTotal {get;set;}
       public bool vehicles_mapDb {get;set;}
       public bool vehicles_mapVersion {get;set;}
       public bool vehicles_user {get;set;}
       public bool vehicles_note {get;set;}
       public bool vehicles_pauseState {get;set;}
       public bool stations {get;set;}
       public bool stations_id {get;set;}
       public bool stations_alias {get;set;}
       public bool stations_physicalId {get;set;}
       public bool stations_logicalId {get;set;}
       public bool stations_group {get;set;}
       public bool stations_point {get;set;}
       public bool stations_direction {get;set;}
       public bool stations_nextPoint {get;set;}
       public bool stations_offset {get;set;}
       public bool stations_unuse {get;set;}
       public bool stations_carrierId {get;set;}
       public bool stations_slideOffset {get;set;}
       public bool stations_user {get;set;}
       public bool stations_note {get;set;}
       public bool buffers {get;set;}
       public bool buffers_id {get;set;}
       public bool buffers_alias {get;set;}
       public bool buffers_physicalId {get;set;}
       public bool buffers_logicalId {get;set;}
       public bool buffers_group {get;set;}
       public bool buffers_point {get;set;}
       public bool buffers_direction {get;set;}
       public bool buffers_nextPoint {get;set;}
       public bool buffers_offset {get;set;}
       public bool buffers_unuse {get;set;}
       public bool buffers_carrierId {get;set;}
       public bool buffers_slideOffset {get;set;}
       public bool buffers_user {get;set;}
       public bool buffers_note {get;set;}
       public bool zcus {get;set;}
       public bool zcus_id {get;set;}
       public bool zcus_using_type {get;set;}
       public bool zcus_type {get;set;}
       public bool zcus_status {get;set;}
       public bool zcus_logicalId {get;set;}
       public bool zcus_passVehicle {get;set;}
       public bool zcus_vehicleCount {get;set;}
       public bool zcus_vehicleInfo {get;set;}
       public bool zcus_errorCode {get;set;}
       public bool cps {get;set;}
       public bool cps_logical_id {get;set;}
       public bool cps_converter_id {get;set;}
       public bool cps_status {get;set;}
       public bool cps_voltage {get;set;}
       public bool cps_current_igbt {get;set;}
       public bool cps_current_track {get;set;}
       public bool cps_frequency {get;set;}
       public bool cps_temp_radiator {get;set;}
       public bool cps_temp_internal {get;set;}
       public bool cps_sync {get;set;}
       public bool cps_backup_id {get;set;}
       public bool cps_error_code {get;set;}
       
       public order[] orders_order {get;set;}
       public order[] vehicles_order {get;set;}
       public order[] stations_order {get;set;}
       public order[] buffers_order {get;set;}
       public order[] zcus_order {get;set;}
       public order[] cps_order {get;set;}
       
    }

    public class order
    {
        public string name {get;set;}
        public string i18nLabel {get;set;}
        public int width{ get;set;}
    }
}