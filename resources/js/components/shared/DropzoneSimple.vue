<script setup>
import { ref } from 'vue';
import { useDropzone } from 'vue3-dropzone';
import SvgSprite from '@/components/shared/SvgSprite.vue';
import { computed } from 'vue';

// assets
import upload from '@/assets/images/upload/upload.svg';
import { object } from 'yup';

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
    type: [Object, String],
    default: () => {}
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

// Track single file only
const singleFile = computed(() => {
    if (props.modelValue && typeof props.modelValue === 'string') {
      return { file: {}, path: props.modelValue }
    }
    return props.modelValue
});
console.log('test');
console.log(singleFile.value);

// Helper function to create a file object with preview if it's an image
const createFileObject = (file) => ({
  file,
  preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null
});

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

// Validate file type and size
const validateFile = (file) => {
  errorMessage.value = '';
  
  // Check file type if accept prop is specified
  if (props.accept !== '*') {
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
      errorMessage.value = `File type not allowed. Accepted types: ${props.accept}`;
      return false;
    }
  }
  
  // Check file size
  if (file.size > props.maxSize) {
    errorMessage.value = `File size too large. Maximum size: ${(props.maxSize / 1024 / 1024).toFixed(1)}MB`;
    return false;
  }
  
  return true;
};

// Single file dropzone
const {
  getRootProps: getSingleRootProps,
  getInputProps: getSingleInputProps,
  isDragActive: isSingleDragActive
} = useDropzone({
  onDrop: (acceptedFiles, rejectedFiles) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      if (validateFile(file)) {
        // singleFile.value = createFileObject(file);
        emit('update:modelValue', createFileObject(file));
      }
    }
    if (rejectedFiles.length > 0) {
      errorMessage.value = 'Some files were rejected. Please check file type and size.';
    }
  },
  accept: props.accept !== '*' ? props.accept : undefined,
  maxSize: props.maxSize
});

// Remove single file
const removeFile = () => {
  // singleFile.value = null;
  emit('update:modelValue', null);
  errorMessage.value = '';
};

// Expose root props and input props
const singleRootProps = getSingleRootProps();
const singleInputProps = getSingleInputProps({ 
  multiple: false,
  accept: props.accept !== '*' ? props.accept : undefined
});

const isSingleDragActiveRef = ref(isSingleDragActive);
</script>

<template>
  <div>
    <v-card v-bind="singleRootProps" variant="outlined" :ripple="false">
      <v-card-item>
        <input v-bind="singleInputProps" />
        <p v-if="isSingleDragActiveRef">Drop the file here ...</p>
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
    
    <div class="mt-3" v-if="singleFile">
      <h6 class="mb-2">Preview:</h6>
      <v-list aria-label="preview list" aria-busy="true">
        <v-list-item class="preview" rounded="md" border="borderLight solid thin opacity-100">
          <template v-slot:prepend>
            <v-img v-if="itsImage(singleFile) && (singleFile.preview || `${getUrlByModul}${singleFile.path}`)" :src="singleFile.preview ?? `${getUrlByModul}${singleFile.path}` " :alt="getFileName(singleFile)" class="preview-image me-2" />
            <div v-else class="me-2 text-lightText">
              <SvgSprite name="custom-note-1" style="width: 30px; height: 30px" />
            </div>
          </template>
          <p class="text-body2">{{ getFileName(singleFile) }}</p>
          <template v-slot:append>
            <v-btn
              variant="tonal"
              icon
              aria-label="close"
              color="error"
              size="small"
              density="compact"
              class="ms-2"
              @click="removeFile()"
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

<!-- DOKUMENTASI PENGGUNAAN DROPZONE SIMPLE -->

<!-- 1. Untuk PDF saja -->
<!-- <DropzoneSimple 
    accept=".pdf,application/pdf"
    :maxSize="5 * 1024 * 1024"
    title="Drag & Drop PDF file or Select file"
    subtitle="Drop PDF files here or click browse through your machine"
/> -->

<!-- 2. Untuk gambar saja -->
<!-- <DropzoneSimple 
    accept=".jpg,.jpeg,.png,.gif"
    :maxSize="2 * 1024 * 1024"
/> -->

<!-- 3. Untuk semua file (default) -->
<!-- <DropzoneSimple /> -->

<!-- 4. Dengan custom baseUrl (RECOMMENDED) -->
<!-- <DropzoneSimple 
    v-model="singleFile"
    modul="cuti"
    :baseUrl="`${authStore.baseUrl}/storage/cuti/`"
    accept=".png, .jpeg, .jpg"
    title="Drag & Drop atau pilih File"
    subtitle="Drop file here or click browse untuk upload file"
/> -->

<!-- 5. Dengan baseUrl untuk modul lain -->
<!-- <DropzoneSimple 
    v-model="singleFile"
    modul="purchase"
    :baseUrl="`${authStore.baseUrl}/storage/purchase/`"
    accept=".pdf,.jpg,.png"
/> -->

<!-- 6. Tanpa baseUrl (akan menggunakan fallback berdasarkan modul) -->
<!-- <DropzoneSimple 
    v-model="singleFile"
    modul="cuti"
    accept=".png, .jpeg, .jpg"
/> -->