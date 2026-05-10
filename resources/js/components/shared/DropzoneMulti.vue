<script setup>
import { ref } from 'vue';
import { useDropzone } from 'vue3-dropzone';
import SvgSprite from '@/components/shared/SvgSprite.vue';
import { computed } from 'vue';
import { useAuthStore } from '@/stores/auth';

// assets
import upload from '@/assets/images/upload/upload.svg';

// Props
const props = defineProps({
  modul: {
    type: String,
    default: null,
  },
  baseUrl: {
    type: String,
    default: null,
  },
  title: {
    type: String,
    default: 'Drag & Drop or Select file'
  },
  subtitle: {
    type: String,
    default: 'Drop files here or click browse through your machine'
  },
  accept: {
    type: String,
    default: '*'
  },
  maxSize: {
    type: Number,
    default: 10 * 1024 * 1024 // 10MB default
  },
  modelValue: {
    type: Array,
    default: () => []
  }
});

const getUrlByModul = computed(() => {
  // Jika baseUrl diberikan dari props, gunakan itu
  if (props.baseUrl) {
    return props.baseUrl;
  }
  
  return null;
});
const emit = defineEmits(['update:modelValue']);
// Track multiple files
const multipleFiles = computed(() => props.modelValue);

// Error message for invalid files
const errorMessage = ref('');

const itsImage = (item) => {
  if(item.file instanceof File){
    return item.file.type === 'image/png' || item.file.type === 'image/jpg' || item.file.type === 'image/jpeg' ? true : false;
  }else{
    var mimes = item.path.split('.');
    mimes = mimes[mimes.length-1];
    return mimes === 'png' || mimes === 'jpg' || mimes === 'jpeg' ? true : false;
  }
}

const getFileName = (item) => {
  if(item.file instanceof File){
    return item.file.name;
  }else{
    var fullname = item.path.split('/');
    fullname = fullname[fullname.length-1];
    // var name = fullname.split('.');
    // name = name[0];
    return fullname;
  }
}

const getImageSrc = (item) => {
  // Jika file baru yang di-upload (memiliki preview)
  if(item.preview) {
    return item.preview;
  }
  
  // Jika file yang sudah ada dari database
  if(item.path && getUrlByModul.value) {
    // Jika path sudah berupa URL lengkap, gunakan langsung
    if(item.path.startsWith('http')) {
      return item.path;
    }
    // Jika path relatif, gabungkan dengan baseUrl
    return `${getUrlByModul.value}${item.path}`;
  }
  
  // Fallback jika tidak ada URL yang valid
  return '';
}

// Validate file type and size
const validateFile = (file) => {
  // Check file type if accept prop is specified
  if (props.accept !== '*') {;
    const acceptedTypes = props.accept.split(',').map(type => type.trim());
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    const mimeType = file.type;
    
    const isValidType = acceptedTypes.some(type => {
      if (type.startsWith('.')) {
        return fileExtension === type.toLowerCase();
      }
      return mimeType === type || mimeType.startsWith(type.replace('*', ''));
    });

    if (!isValidType) {
      return { valid: false, error: `File type not allowed. Accepted types: ${props.accept}` };
    }
  }
  
  // Check file size
  if (file.size > props.maxSize) {
    return { valid: false, error: `File size too large. Maximum size: ${(props.maxSize / 1024 / 1024).toFixed(1)}MB` };
  }
  
  return { valid: true };
};

// Helper function to create a file object with preview if it's an image
const createFileObject = (file) => ({
  file,
  preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null
});

// Multiple files dropzone
const {
  getRootProps: getMultipleRootProps,
  getInputProps: getMultipleInputProps,
  isDragActive: isMultipleDragActive
} = useDropzone({
  onDrop: (acceptedFiles, rejectedFiles) => {
    errorMessage.value = '';
    const validFiles = [];
    const errors = [];
    
    acceptedFiles.forEach(file => {
      const validation = validateFile(file);
      console.log('validation',validation)
      if (validation.valid) {
        validFiles.push(createFileObject(file));
      } else {
        errors.push(validation.error);
      }
    });
    
    if (validFiles.length > 0) {
      // multipleFiles.value.push(...validFiles);
      emit('update:modelValue', [...props.modelValue, ...validFiles]);
    }
    
    if (rejectedFiles.length > 0 || errors.length > 0) {
      errorMessage.value = errors.length > 0 ? errors[0] : 'Some files were rejected. Please check file type and size.';
    }
  },
  accept: props.accept !== '*' ? props.accept : undefined,
  maxSize: props.maxSize
});

// Remove file from multiple files
const removeFile = (fileToRemove) => {
  // Filter berdasarkan file object atau path untuk file yang sudah ada
  const updatedFiles = props.modelValue.filter(f => {
    // Jika file baru (memiliki property file)
    if (f.file instanceof File && fileToRemove instanceof File) {
      return f.file !== fileToRemove;
    }
    // Jika file dari database (memiliki property path)
    if (f.path && !f.file) {
      return f !== fileToRemove;
    }
    // Untuk kasus lainnya
    return f.file !== fileToRemove;
  });
  
  if (updatedFiles.length === 0) {
    errorMessage.value = '';
  }
  emit('update:modelValue', updatedFiles);
};

// Expose root props and input props
const multipleRootProps = getMultipleRootProps();
const multipleInputProps = getMultipleInputProps({ 
  multiple: true,
  accept: props.accept !== '*' ? props.accept : undefined
});

const isMultipleDragActiveRef = ref(isMultipleDragActive);

defineExpose({
  multipleFiles
});
</script>

<template>
  <div>
    <v-card v-bind="multipleRootProps" variant="outlined" :ripple="false">
      <v-card-item>
        <input v-bind="multipleInputProps" />
        <p v-if="isMultipleDragActiveRef">Drop the files here ...</p>
        <div class="d-sm-flex align-center justify-sm-start justify-center" v-else>
          <v-img
            :src="upload"
            alt="upload"
            class="me-sm-4 ms-sm-0 ms-auto me-auto"
            style="max-height: 60px; max-width: 60px; width: 60px"
          />
          <div class="text-sm-start text-center mt-sm-0 mt-3">
            <h6 class="text-h6 mb-1">{{ props.title }}</h6>
            <p class="text-lightText text-caption">
              {{ props.subtitle.split('browse')[0] }}<span class="text-body2 text-primary text-decoration-underline">browse</span>{{ props.subtitle.split('browse')[1] || '' }}
            </p>
          </div>
        </div>
      </v-card-item>
    </v-card>
    
    <!-- Error message -->
    <v-alert
      v-if="errorMessage"
      type="error"
      variant="tonal"
      class="mt-3"
      closable
      @click:close="errorMessage = ''"
    >
      {{ errorMessage }}
    </v-alert>
    
    <div class="mt-3" v-if="multipleFiles.length > 0">
      <h6 class="mb-2">Preview:</h6>
      <v-list aria-label="preview list" aria-busy="true">
        <v-list-item 
          v-for="(fileObj, index) in multipleFiles" 
          :key="index"
          class="preview mb-2" 
          rounded="md" 
          border="borderLight solid thin opacity-100"
        >
          <template v-slot:prepend>
            <v-img v-if="itsImage(fileObj) && getImageSrc(fileObj)" :src="getImageSrc(fileObj)" :alt="getFileName(fileObj)" class="preview-image me-2" />
            <div v-else class="me-2 text-lightText">
              <SvgSprite name="custom-note-1" style="width: 30px; height: 30px" />
            </div>
          </template>
          <p class="text-body2">{{ getFileName(fileObj) }}</p>
          <template v-slot:append>
            <v-btn
              variant="tonal"
              icon
              aria-label="close"
              color="error"
              size="small"
              density="compact"
              class="ms-2"
              @click="removeFile(fileObj.file || fileObj)"
            >
              <SvgSprite name="custom-close" style="width: 16px; height: 16px; transform: rotate(45deg)" />
            </v-btn>
          </template>
        </v-list-item>
      </v-list>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.preview-image {
  width: 40px;
  height: 40px;
}
</style>

<!-- DOKUMENTASI PENGGUNAAN DROPZONE MULTI -->

<!-- 1. Untuk PDF saja -->
<!-- <DropzoneMulti 
    accept=".pdf,application/pdf"
    :maxSize="5 * 1024 * 1024"
    title="Drag & Drop PDF files or Select files"
    subtitle="Drop PDF files here or click browse through your machine"
/> -->

<!-- 2. Untuk gambar saja -->
<!-- <DropzoneMulti 
    accept=".jpg,.jpeg,.png,.gif"
    :maxSize="2 * 1024 * 1024"
/> -->

<!-- 3. Untuk semua file (default) -->
<!-- <DropzoneMulti /> -->

<!-- 4. Dengan custom baseUrl (RECOMMENDED) -->
<!-- <DropzoneMulti 
    v-model="multipleFiles"
    modul="cuti"
    :baseUrl="`${authStore.baseUrl}/storage/cuti/`"
    accept=".png, .jpeg, .jpg"
    title="Drag & Drop atau pilih File"
    subtitle="Drop files here or click browse untuk upload file"
/> -->

<!-- 5. Dengan baseUrl untuk modul lain -->
<!-- <DropzoneMulti 
    v-model="multipleFiles"
    modul="purchase"
    :baseUrl="`${authStore.baseUrl}/storage/purchase/`"
    accept=".pdf,.jpg,.png"
/> -->

<!-- 6. Tanpa baseUrl (akan menggunakan fallback berdasarkan modul) -->
<!-- <DropzoneMulti 
    v-model="multipleFiles"
    modul="cuti"
    accept=".png, .jpeg, .jpg"
/> -->