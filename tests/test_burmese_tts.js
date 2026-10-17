// Automated tests for Burmese TTS Generation & Audio Integrity Validation
import {
  chunkBurmeseText,
  synthesizeGoogleNativeBurmese,
  validateAudioFile,
  getAvailableTTSProviders,
} from '../server/tts.js';
import fs from 'fs';
import path from 'path';

async function runTests() {
  console.log('--- STARTING BURMESE TTS VERIFICATION SUITE ---');

  // Test 1: Provider Availability Check
  console.log('\n[TEST 1]: Checking Available TTS Providers...');
  const providers = getAvailableTTSProviders(null);
  console.log(`Found ${providers.length} registered TTS providers:`);
  providers.forEach((p) => {
    console.log(` - [${p.id}]: ${p.name} (Available: ${p.available}, Supports Burmese: ${p.supportsBurmese})`);
  });

  const nativeBurmese = providers.find((p) => p.id === 'google-burmese');
  if (!nativeBurmese || !nativeBurmese.available || !nativeBurmese.supportsBurmese) {
    throw new Error('FAILED: Google Native Burmese TTS provider is not available or does not support Burmese.');
  }
  console.log('✓ PASS: Google Native Burmese provider is configured and ready.');

  // Test 2: Myanmar Unicode Text Segmentation
  console.log('\n[TEST 2]: Testing Burmese Sentence Segmentation...');
  const sampleScript = `[0:00 - 0:15] ဒီဇာတ်ကားဟာ အမှောင်ထုထဲက လူသတ်သမားတစ်ယောက်နဲ့ သူ့နောက်ကို လိုက်နေတဲ့ စုံထောက်မင်းသူတို့ရဲ့ အသည်းတယားယား အသက်လုတိုက်ပွဲ ဖြစ်ပါတယ်။ အမှုရဲ့နောက်ကွယ်မှာ မြို့တော်ရဲ့ အကြီးမားဆုံး လျှို့ဝှက်ချက် ရှိနေပါတယ်။ ပရိသတ်ကြီး မလွတ်တမ်း ကြည့်ရှုလိုက်ရအောင်။`;
  const chunks = chunkBurmeseText(sampleScript, 100);
  console.log(`Input length: ${sampleScript.length} chars -> Produced ${chunks.length} clean chunks:`);
  chunks.forEach((c, idx) => console.log(`   Chunk ${idx + 1} (${c.length} chars): ${c}`));

  if (chunks.length < 2) {
    throw new Error('FAILED: Expected script to be segmented into multiple chunks.');
  }
  if (chunks.some((c) => c.includes('[0:00 - 0:15]'))) {
    throw new Error('FAILED: Timestamp tags should be cleanly stripped.');
  }
  console.log('✓ PASS: Burmese script correctly stripped and segmented at punctuation boundaries.');

  // Test 3: Real Audio Synthesis and Concatenation
  console.log('\n[TEST 3]: Generating Real Audio via Google Native Burmese TTS Engine...');
  const testPhrase = 'မင်္ဂလာပါ ခင်ဗျာ။ TAI RECAP AI မှ ကြိုဆိုပါတယ်။ ဤဇာတ်ကားသည် အလွန်စိတ်လှုပ်ရှားဖွယ် ကောင်းပါသည်။';
  
  let reportedProgress = [];
  const result = await synthesizeGoogleNativeBurmese(testPhrase, 1.0, (pct, msg) => {
    reportedProgress.push({ pct, msg });
    console.log(`   Progress [${pct}%]: ${msg}`);
  });

  console.log('\nSynthesis Result Details:');
  console.log(` - Provider: ${result.providerName}`);
  console.log(` - Audio URL: ${result.audioUrl}`);
  console.log(` - File Path: ${result.filePath}`);
  console.log(` - File Size: ${(result.fileSizeBytes / 1024).toFixed(1)} KB`);
  console.log(` - Duration: ${result.durationSec}s`);
  console.log(` - Segments Processed: ${result.segmentsProcessed}`);
  console.log(` - Validation Codec: ${result.validation.codec}`);

  if (!fs.existsSync(result.filePath)) {
    throw new Error(`FAILED: Generated audio file does not exist at ${result.filePath}`);
  }
  if (result.fileSizeBytes < 1000) {
    throw new Error(`FAILED: File size (${result.fileSizeBytes} bytes) is suspiciously small.`);
  }
  if (result.durationSec <= 0.5) {
    throw new Error(`FAILED: Audio duration (${result.durationSec}s) is invalid.`);
  }
  console.log('✓ PASS: Real Burmese audio file generated and stored on server.');

  // Test 4: ffprobe Audio Stream Integrity Validation
  console.log('\n[TEST 4]: Validating Audio Integrity via ffprobe...');
  const validation = await validateAudioFile(result.filePath);
  console.log('ffprobe Output:', JSON.stringify(validation, null, 2));
  if (!validation.isValid || validation.channels < 1 || validation.sampleRate < 8000) {
    throw new Error('FAILED: ffprobe audio validation failed.');
  }
  console.log('✓ PASS: ffprobe verified valid audio stream, codec, sample rate, and non-zero duration.');

  // Test 5: Speed Adjustment Validation (atempo=1.25)
  console.log('\n[TEST 5]: Testing Speed Adjustment (1.25x tempo)...');
  const speedResult = await synthesizeGoogleNativeBurmese(testPhrase, 1.25);
  console.log(`Normal Duration (1.0x): ${result.durationSec}s | Fast Duration (1.25x): ${speedResult.durationSec}s`);
  if (speedResult.durationSec >= result.durationSec) {
    throw new Error('FAILED: 1.25x speed audio should have shorter duration than 1.0x.');
  }
  console.log('✓ PASS: Audio tempo filter works accurately.');

  console.log('\n===========================================');
  console.log('ALL BURMESE TTS VERIFICATION TESTS PASSED!');
  console.log('===========================================');
}

runTests().catch((err) => {
  console.error('\nTEST SUITE FAILED:', err);
  process.exit(1);
});
