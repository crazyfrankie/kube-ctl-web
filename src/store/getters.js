const getters = {
  sidebar: state => state.app.sidebar,
  device: state => state.app.device,
  token: state => state.user.token,
  avatar: state => state.user.avatar,
  name: state => state.user.name,
  // Dashboard getters
  clusterInfo: state => state.dashboard.clusterInfo,
  resourcesInfo: state => state.dashboard.resourcesInfo,
  usageInfo: state => state.dashboard.usageInfo,
  usageRangeInfo: state => state.dashboard.usageRangeInfo
}
export default getters
