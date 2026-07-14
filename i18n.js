/* ═══════════════════════════════════════════════════════════════════════
   CompyMirror — i18n (internationalisation)
   English (default) + Korean
   ═══════════════════════════════════════════════════════════════════════ */

const I18N = {
  en: {
    // header
    brandTag:         'Liquid Chrome Mirror',
    privacyTitle:     'All video processing happens only inside this browser',
    privacyBadge:     '<b>Local only</b> · Video & AI processed on-device',
    guideTitle:       'View user guide',
    guideLabel:       'User guide',

    // placeholder
    phText:           'Camera is off',
    phSub:            'Press "Start Camera" below to turn on the mirror',

    // controls
    startCam:         'Start Camera',
    stopCam:          'Stop',
    flipTitle:        'Flip horizontally',
    flip:             'Flip',
    modeTitle:        'Switch ratio (Original → 9:16 → 1:1)',
    boothTitle:       '3s countdown × 4 shots',
    booth:            'Photo Booth',
    snapshot:         'Snapshot',
    selfTimer:        'Self Timer',

    // mode labels
    modeAuto:         'Original',
    modePortrait:     '9:16',
    modeSquare:       '1:1',

    // snapshot drawer
    snapTitle:        'Your latest shot',
    igTitle:          'Share to Instagram via share sheet',
    igLabel:          'Share to Instagram',
    kakaoTitle:       'Share to KakaoTalk via share sheet',
    kakaoLabel:       'Share to KakaoTalk',
    share:            'Share',
    enhance:          'Enhance',
    save:             'Save',

    // presets
    presetKicker:     'Presets',
    presetOff:        'None',
    presetNatural:    'Natural',
    presetGlow:       'Glow',
    presetVivid:      'Vivid',
    presetMono:       'B&W',
    presetWarm:       'Warm',
    presetCool:       'Cool',

    // adjustments
    adjustKicker:     'Adjustments',
    brightness:       'Brightness',
    contrast:         'Contrast',
    saturation:       'Saturation',
    warmth:           'Warmth',
    skinSmooth:       'Skin Smooth',
    sharpness:        'Sharpness',
    resetAll:         'Reset All',

    // footer
    footCopy:         '© 2026 · Local only · No personal data',
    feedback:         'Feedback',
    donate:           'Donate',

    // tour
    tourSkip:         'Skip',
    tourPrev:         'Previous',
    tourNext:         'Next',
    tourStart:        'Get Started',
    tourStep1Title:   'Start Camera & Privacy',
    tourStep1Body:    'Press to request permission — click <b>Allow</b> to start. All video & AI processing stays <b>on this device</b> and is never uploaded.',
    tourStep2Title:   'Switch Ratio',
    tourStep2Body:    'One button cycles <b>Original → 9:16 → 1:1</b>. Set it before you shoot.',
    tourStep3Title:   'Photo Booth',
    tourStep3Body:    '3-second countdown auto-captures <b>4 shots</b>. Pick a frame, then save or share.',
    tourStep4Title:   'After Shooting',
    tourStep4Body:    'From the preview, you can <b>save · share · enhance</b> (on-device AI upscale).',
    tourStep5Title:   'Presets & Fine-tuning',
    tourStep5Body:    'Set the mood instantly. Use the sliders below to fine-tune brightness, skin smoothing, sharpness, and more.',

    // booth modal
    boothModalTitle:  'Photo Booth',
    close:            'Close',
    frameSilver:      'Silver',
    frameHolo:        'Holo',
    frameOnyx:        'Onyx',
    retake:           'Retake',

    // feedback modal
    feedbackTitle:    'Feedback',

    // donate modal
    donateTitle:      'Donate ✦',
    donateHint:       'Scan with <b>KakaoPay</b> or<br>KakaoTalk → Transfer → QR Code',

    // toast messages
    camError:         'Camera error: ',
    camLabel:         'Camera ',
    imgFail:          'Failed to create image',
    imgCopied:        'Image copied — paste it in KakaoTalk or Instagram',
    noShareFallback:  'Direct share not supported — saved instead',
    saved:            'Saved',
    enhancing:        'Enhancing on-device… (please wait)',
    enhanceFail:      'Enhancement failed',
    enhanceDone:      '✓ Enhanced',
    enhancingSpinner: '<span class="spinner"></span> Enhancing…',
    enhanceAIDone:    'AI enhancement complete ✨',
    enhanceLocalDone: 'Detail enhancement complete ✨ (AI not available → auto-enhanced)',

    // share text
    shareStory:       'CompyMirror ✨ #PhotoBooth',
    shareKakao:       'Taken with CompyMirror ✨',
  },

  ko: {
    brandTag:         'Liquid Chrome Mirror',
    privacyTitle:     '모든 영상 처리는 이 브라우저 안에서만 일어납니다',
    privacyBadge:     '<b>로컬 전용</b>· 영상·AI 처리 모두 기기 안에서',
    guideTitle:       '사용 가이드 다시 보기',
    guideLabel:       '사용 가이드',

    phText:           '카메라가 꺼져 있습니다',
    phSub:            '아래 "카메라 시작"을 눌러 거울을 켜세요',

    startCam:         '카메라 시작',
    stopCam:          '끄기',
    flipTitle:        '좌우 반전',
    flip:             '반전',
    modeTitle:        '비율 전환 (원본 → 9:16 → 1:1)',
    boothTitle:       '3초 카운트다운 ×4컷',
    booth:            '인생네컷',
    snapshot:         '스냅샷',
    selfTimer:        '셀프 타이머',

    modeAuto:         '원본',
    modePortrait:     '9:16',
    modeSquare:       '1:1',

    snapTitle:        '방금 찍은 한 장',
    igTitle:          '공유 시트에서 인스타 선택',
    igLabel:          'Instagram 공유',
    kakaoTitle:       '공유 시트에서 카톡 선택',
    kakaoLabel:       '카카오톡 공유',
    share:            '공유',
    enhance:          '화질 향상',
    save:             '저장',

    presetKicker:     '프리셋',
    presetOff:        '없음',
    presetNatural:    '내추럴',
    presetGlow:       '글로우',
    presetVivid:      '비비드',
    presetMono:       '흑백',
    presetWarm:       '웜톤',
    presetCool:       '쿨톤',

    adjustKicker:     '세부 조절',
    brightness:       '밝기',
    contrast:         '대비',
    saturation:       '채도',
    warmth:           '따뜻함',
    skinSmooth:       '피부보정',
    sharpness:        '선명도',
    resetAll:         '전체 초기화',

    footCopy:         '© 2026 · 로컬 전용 · 개인정보 없음',
    feedback:         '피드백',
    donate:           '후원하기',

    tourSkip:         '건너뛰기',
    tourPrev:         '이전',
    tourNext:         '다음',
    tourStart:        '시작하기',
    tourStep1Title:   '카메라 켜기 & 프라이버시',
    tourStep1Body:    '누르면 권한을 물어봐요 — <b>허용</b>하면 켜집니다. 영상·AI 모두 <b>이 기기 안에서만</b> 처리되고 업로드되지 않아요.',
    tourStep2Title:   '비율 전환',
    tourStep2Body:    '버튼 하나로 <b>원본 → 9:16 → 1:1</b> 순환. 찍기 전에 맞춰두세요.',
    tourStep3Title:   '인생네컷',
    tourStep3Body:    '3초 카운트로 <b>4컷</b>이 자동 촬영돼요. 끝나면 프레임을 골라 저장·공유.',
    tourStep4Title:   '찍은 뒤',
    tourStep4Body:    '미리보기에서 <b>저장 · 공유 · 화질 향상</b>(기기 안 AI 업스케일)을 할 수 있어요.',
    tourStep5Title:   '프리셋 & 세부 조절',
    tourStep5Body:    '분위기를 한 번에. 아래 슬라이더로 밝기·피부보정·선명도까지 미세 조정도 돼요.',

    boothModalTitle:  '인생네컷',
    close:            '닫기',
    frameSilver:      '실버',
    frameHolo:        '홀로',
    frameOnyx:        '오닉스',
    retake:           '다시 찍기',

    feedbackTitle:    '피드백',

    donateTitle:      '후원하기 ✦',
    donateHint:       '<b>카카오페이</b>로 스캔하거나<br>카카오톡 → 송금 → QR 코드 선택',

    camError:         '카메라 오류: ',
    camLabel:         '카메라 ',
    imgFail:          '이미지 생성에 실패했어요',
    imgCopied:        '이미지를 복사했어요 — 카톡·인스타에 붙여넣기 하세요',
    noShareFallback:  '이 환경은 직접 공유를 지원하지 않아 저장했어요',
    saved:            '저장했어요',
    enhancing:        '기기 안에서 화질을 향상하는 중… (잠시만요)',
    enhanceFail:      '화질 향상에 실패했어요',
    enhanceDone:      '✓ 향상됨',
    enhancingSpinner: '<span class="spinner"></span> 향상 중…',
    enhanceAIDone:    'AI 화질 향상 완료 ✨',
    enhanceLocalDone: '디테일 보정 완료 ✨ (AI 미지원 환경 → 자동 보정)',

    shareStory:       'CompyMirror ✨ #인생네컷',
    shareKakao:       'CompyMirror로 찍었어요 ✨',
  }
};

let _lang = 'en';
const LANG_KEY = 'compymirror_lang';

function t(key) {
  return (I18N[_lang] && I18N[_lang][key]) || I18N.en[key] || key;
}

function getLang() { return _lang; }

function setLang(lang) {
  if (!I18N[lang]) return;
  _lang = lang;
  try { localStorage.setItem(LANG_KEY, lang); } catch(e) {}
  document.documentElement.lang = lang;
  applyI18n();
}

function applyI18n() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    const val = t(key);
    if (el.dataset.i18nHtml !== undefined) el.innerHTML = val;
    else el.textContent = val;
  });
  document.querySelectorAll('[data-i18n-title]').forEach(el => {
    el.title = t(el.dataset.i18nTitle);
  });
  document.querySelectorAll('[data-i18n-label]').forEach(el => {
    el.setAttribute('aria-label', t(el.dataset.i18nLabel));
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    el.placeholder = t(el.dataset.i18nPlaceholder);
  });

  const langBtns = document.querySelectorAll('.lang-btn');
  langBtns.forEach(b => b.classList.toggle('on', b.dataset.lang === _lang));
}

function initI18n() {
  let saved;
  try { saved = localStorage.getItem(LANG_KEY); } catch(e) {}
  if (saved && I18N[saved]) {
    _lang = saved;
  } else {
    const nav = (navigator.language || '').toLowerCase();
    _lang = nav.startsWith('ko') ? 'ko' : 'en';
  }
  document.documentElement.lang = _lang;
  applyI18n();
}
