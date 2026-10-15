Pod::Spec.new do |s|
  s.name           = 'BroadcastEvents'
  s.version        = '1.0.0'
  s.summary        = 'Forwards the iOS screen broadcast extension start/stop notifications to JS'
  s.description    = s.summary
  s.author         = 'Mconf'
  s.homepage       = 'https://github.com/mconf/bbb-mobile-sdk'
  s.platforms      = { :ios => '16.4' }
  s.source         = { git: '' }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'

  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
  }

  s.source_files = '**/*.{h,m,swift}'
end
