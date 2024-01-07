package plg_backend_oss

import (
	"context"
	"fmt"
	"strconv"

	"github.com/aliyun/aliyun-oss-go-sdk/oss"

	. "github.com/KamelTechnology/KamelBox/server/common"

	"io"
	"os"
	"path/filepath"
	"strings"
)

var OSSCache AppCache

type OSSBackend struct {
	client     *oss.Client
	params     map[string]string
	context    context.Context
	threadSize int
}

func init() {
	Backend.Register("OSS", OSSBackend{})
	OSSCache = NewAppCache(2, 1)
}

func (this OSSBackend) Init(params map[string]string, app *App) (IBackend, error) {
	if params["encryption_key"] != "" && len(params["encryption_key"]) != 32 {
		return nil, NewError(fmt.Sprintf("Encryption key needs to be 32 characters (current: %d)", len(params["encryption_key"])), 400)
	}
	if params["region"] == "" {
		params["region"] = "oss-me-central-1"
	}

	if params["endpoint"] == "" {
		params["endpoint"] = "oss-me-central-1.aliyuncs.com"
	}

	threadSize, err := strconv.Atoi(params["number_thread"])
	if err != nil {
		threadSize = 50
	} else if threadSize > 5000 || threadSize < 1 {
		threadSize = 2
	}
	client, err := oss.New(params["endpoint"], params["access_key_id"], params["secret_access_key"])
	if err != nil {
		return nil, err
	}
	backend := &OSSBackend{
		// config:     config,
		params:     params,
		client:     client,
		context:    app.Context,
		threadSize: threadSize,
	}
	return backend, nil
}

func (this OSSBackend) LoginForm() Form {
	return Form{
		Elmnts: []FormElement{
			FormElement{
				Name:  "type",
				Type:  "hidden",
				Value: "OSS",
			},
			FormElement{
				Name:        "access_key_id",
				Type:        "text",
				Placeholder: "Access Key ID*",
			},
			FormElement{
				Name:        "secret_access_key",
				Type:        "password",
				Placeholder: "Secret Access Key*",
			},
			FormElement{
				Name:        "advanced",
				Type:        "enable",
				Placeholder: "Advanced",
				Target: []string{
					"oss_region", "oss_endpoint", "oss_role_arn", "oss_session_token",
					"oss_path", "oss_encryption_key", "oss_number_thread",
				},
			},
			FormElement{
				Id:          "oss_region",
				Name:        "region",
				Type:        "text",
				Placeholder: "Region",
			},
			FormElement{
				Id:          "oss_endpoint",
				Name:        "endpoint",
				Type:        "text",
				Placeholder: "Endpoint",
			},
			FormElement{
				Id:          "oss_role_arn",
				Name:        "role_arn",
				Type:        "text",
				Placeholder: "Role ARN",
			},
			FormElement{
				Id:          "oss_session_token",
				Name:        "session_token",
				Type:        "text",
				Placeholder: "Session Token",
			},
			FormElement{
				Id:          "oss_path",
				Name:        "path",
				Type:        "text",
				Placeholder: "Path",
			},
			FormElement{
				Id:          "oss_encryption_key",
				Name:        "encryption_key",
				Type:        "text",
				Placeholder: "Encryption Key",
			},
			FormElement{
				Id:          "oss_number_thread",
				Name:        "number_thread",
				Type:        "text",
				Placeholder: "Num. Thread",
			},
		},
	}
}

func (this OSSBackend) Meta(path string) Metadata {
	if path == "/" {
		return Metadata{
			CanCreateFile: NewBool(false),
			CanRename:     NewBool(false),
			CanMove:       NewBool(false),
			CanUpload:     NewBool(false),
		}
	}
	return Metadata{}
}

func (this OSSBackend) Ls(path string) (files []os.FileInfo, err error) {
	files = make([]os.FileInfo, 0)
	p := this.path(path)
	if p.bucket == "" {
		// bucket, err := this.client.Bucket(p.bucket)
		// if err != nil {
		// 	return nil, err
		// }
		b, err := this.client.ListBuckets(oss.Prefix(""))
		if err != nil {
			return nil, err
		}
		for _, bucket := range b.Buckets {
			files = append(files, &File{
				FName:   bucket.Name,
				FType:   "directory",
				FTime:   bucket.CreationDate.Unix(),
				CanMove: NewBool(false),
			})
		}
		return files, nil
	}
	bucket, err := this.client.Bucket(p.bucket)
	if err != nil {
		return nil, err
	}

	continueToken := ""
	for {
		lsRes, err := bucket.ListObjectsV2(oss.Prefix(p.path), oss.ContinuationToken(continueToken), oss.Delimiter("/"))
		if err != nil {
			return nil, err
		}

		for i, object := range lsRes.Objects {
			if i == 0 && object.Key == p.path {
				continue
			}
			files = append(files, &File{
				FName: filepath.Base(object.Key),
				FType: "file",
				FTime: object.LastModified.Unix(),
				FSize: object.Size,
			})
		}
		for _, dirName := range lsRes.CommonPrefixes {
			files = append(files, &File{
				FName: filepath.Base(dirName),
				FType: "directory",
			})
			// fmt.Println(dirName)
		}
		if lsRes.IsTruncated {
			continueToken = lsRes.NextContinuationToken
		} else {
			break
		}
	}
	return files, err
}

func (this OSSBackend) Cat(path string) (io.ReadCloser, error) {
	p := this.path(path)

	bucket, err := this.client.Bucket(p.bucket)
	if err != nil {
		return nil, err
	}
	obj, err := bucket.GetObject(p.path)
	// if err != nil {
	// 	awsErr, ok := err.(awserr.Error)
	// 	if ok == false {
	// 		return nil, err
	// 	}
	// 	if awsErr.Code() == "InvalidRequest" && strings.Contains(awsErr.Message(), "encryption") {
	// 		input.SSECustomerAlgorithm = nil
	// 		input.SSECustomerKey = nil
	// 		obj, err = this.client.GetObject(input)
	// 		return obj.Body, err
	// 	} else if awsErr.Code() == "InvalidArgument" && strings.Contains(awsErr.Message(), "secret key was invalid") {
	// 		return nil, NewError("This file is encrypted file, you need the correct key!", 400)
	// 	} else if awsErr.Code() == "AccessDenied" {
	// 		return nil, ErrNotAllowed
	// 	}
	// 	return nil, err
	// }
	return obj, nil
}

func (this OSSBackend) Mkdir(path string) error {
	p := this.path(path)
	bucket, err := this.client.Bucket(p.bucket)
	if err != nil {
		return err
	}
	// client := s3.New(this.createSession(p.bucket))
	// if p.path == "" {
	// 	_, err := client.CreateBucket(&s3.CreateBucketInput{
	// 		Bucket: aws.String(path),
	// 	})
	// 	return err
	// }
	err2 := bucket.PutObject(path, strings.NewReader(""))
	return err2
}

func (this OSSBackend) Rm(path string) error {
	p := this.path(path)
	bucket, err := this.client.Bucket(p.bucket)
	if err != nil {
		return err
	}
	// client := s3.New(this.createSession(p.bucket))
	if p.bucket == "" {
		return ErrNotFound
	}
	// CASE 1: remove a file
	if strings.HasSuffix(path, "/") == false {
		err := bucket.DeleteObject(p.path)
		return err
	}
	// CASE 2: remove a folder
	// List objects with the specified prefix
	objects, err := listObjects(bucket, p.path)
	if err != nil {
		return err
	}

	// Delete each object with the specified prefix
	for _, obj := range objects {
		err := bucket.DeleteObject(obj.Key)
		if err != nil {
			return err
		}
	}
	// CASE 2: remove a folder
	// jobChan := make(chan OSSPath, this.threadSize)
	// errChan := make(chan error, this.threadSize)
	// ctx, cancel := context.WithCancel(this.context)
	// var wg sync.WaitGroup
	// for i := 1; i <= this.threadSize; i++ {
	// 	wg.Add(1)
	// 	go func() {
	// 		for spath := range jobChan {
	// 			if ctx.Err() != nil {
	// 				continue
	// 			}
	// 			if _, err := bucket.DeleteObject(spath.path);
	// 			err != nil {
	// 				cancel()
	// 				errChan <- err
	// 			}
	// 		}
	// 		wg.Done()
	// 	}()
	// }
	// err := this.client.ListObjectsV2PagesWithContext(
	// 	this.context,
	// 	&s3.ListObjectsV2Input{
	// 		Bucket: aws.String(p.bucket),
	// 		Prefix: aws.String(p.path),
	// 	},
	// 	func(objs *s3.ListObjectsV2Output, lastPage bool) bool {
	// 		if ctx.Err() != nil {
	// 			return false
	// 		}
	// 		for _, object := range objs.Contents {
	// 			jobChan <- OSSPath{p.bucket, *object.Key}
	// 		}
	// 		return aws.BoolValue(objs.IsTruncated)
	// 	},
	// )
	// close(jobChan)
	// wg.Wait()
	// close(errChan)
	// if err != nil {
	// 	return err
	// }
	// for err := range errChan {
	// 	return err
	// }
	// if p.path == "" {
	// 	_, err := client.DeleteBucket(&s3.DeleteBucketInput{
	// 		Bucket: aws.String(p.bucket),
	// 	})
	// 	return err
	// }
	return err
}

func (this OSSBackend) Mv(from string, to string) error {
	if from == to {
		return nil
	}
	f := this.path(from)
	t := this.path(to)
	if t.bucket != f.bucket {
		return nil
	}
	bucket, err := this.client.Bucket(f.bucket)
	if err != nil {
		return err
	}
	// client := s3.New(this.createSession(f.bucket))

	// CASE 1: Rename a bucket
	if f.path == "" {
		return ErrNotImplemented
	}
	// CASE 2: Rename/Move a file
	if strings.HasSuffix(from, "/") == false {
		// input := &s3.CopyObjectInput{
		// 	CopySource: aws.String(fmt.Sprintf("%s/%s", f.bucket, f.path)),
		// 	Bucket:     aws.String(t.bucket),
		// 	Key:        aws.String(t.path),
		// }
		// if this.params["encryption_key"] != "" {
		// 	input.CopySourceSSECustomerAlgorithm = aws.String("AES256")
		// 	input.CopySourceSSECustomerKey = aws.String(this.params["encryption_key"])
		// 	input.SSECustomerAlgorithm = aws.String("AES256")
		// 	input.SSECustomerKey = aws.String(this.params["encryption_key"])
		// }
		_, err := bucket.CopyObject(t.path, f.path)
		if err != nil {
			return err
		}
		err = bucket.DeleteObject(f.path)
		return err
	}
	// CASE 3: Rename/Move a folder
	// jobChan := make(chan []OSSPath, this.threadSize)
	// errChan := make(chan error, this.threadSize)
	// ctx, cancel := context.WithCancel(this.context)
	// var wg sync.WaitGroup
	// for i := 1; i <= this.threadSize; i++ {
	// 	wg.Add(1)
	// 	go func() {
	// 		for spath := range jobChan {
	// 			if ctx.Err() != nil {
	// 				continue
	// 			}
	// 			input := &s3.CopyObjectInput{
	// 				CopySource: aws.String(fmt.Sprintf("%s/%s", spath[0].bucket, spath[0].path)),
	// 				Bucket:     aws.String(spath[1].bucket),
	// 				Key:        aws.String(spath[1].path),
	// 			}
	// 			if this.params["encryption_key"] != "" {
	// 				input.CopySourceSSECustomerAlgorithm = aws.String("AES256")
	// 				input.CopySourceSSECustomerKey = aws.String(this.params["encryption_key"])
	// 				input.SSECustomerAlgorithm = aws.String("AES256")
	// 				input.SSECustomerKey = aws.String(this.params["encryption_key"])
	// 			}
	// 			_, err := client.CopyObject(input)
	// 			if err != nil {
	// 				cancel()
	// 				errChan <- err
	// 				continue
	// 			}
	// 			_, err = client.DeleteObject(&s3.DeleteObjectInput{
	// 				Bucket: aws.String(spath[0].bucket),
	// 				Key:    aws.String(spath[0].path),
	// 			})
	// 			if err != nil {
	// 				cancel()
	// 				errChan <- err
	// 				continue
	// 			}
	// 		}
	// 		wg.Done()
	// 	}()
	// }
	// err := client.ListObjectsV2PagesWithContext(
	// 	this.context,
	// 	&s3.ListObjectsV2Input{
	// 		Bucket: aws.String(f.bucket),
	// 		Prefix: aws.String(f.path),
	// 	},
	// 	func(objs *s3.ListObjectsV2Output, lastPage bool) bool {
	// 		if ctx.Err() != nil {
	// 			return false
	// 		}
	// 		for _, object := range objs.Contents {
	// 			jobChan <- []OSSPath{
	// 				{f.bucket, *object.Key},
	// 				{t.bucket, t.path + strings.TrimPrefix(*object.Key, f.path)},
	// 			}
	// 		}
	// 		return aws.BoolValue(objs.IsTruncated)
	// 	},
	// )
	// close(jobChan)
	// wg.Wait()
	// close(errChan)
	// if err != nil {
	// 	return err
	// }
	// for err := range errChan {
	// 	return err
	// }
	return nil
}

func (this OSSBackend) Touch(path string) error {
	p := this.path(path)
	// client := s3.New(this.createSession(p.bucket))
	if p.bucket == "" {
		return ErrNotValid
	}
	bucket, err := this.client.Bucket(p.bucket)
	if err != nil {
		return err
	}
	// input := &s3.PutObjectInput{
	// 	Body:          strings.NewReader(""),
	// 	ContentLength: aws.Int64(0),
	// 	Bucket:        aws.String(p.bucket),
	// 	Key:           aws.String(p.path),
	// }
	// if this.params["encryption_key"] != "" {
	// 	input.SSECustomerAlgorithm = aws.String("AES256")
	// 	input.SSECustomerKey = aws.String(this.params["encryption_key"])
	// }
	err2 := bucket.PutObject(p.path, strings.NewReader(""))
	return err2
}

func (this OSSBackend) Save(path string, file io.Reader) error {
	p := this.path(path)
	if p.bucket == "" {
		return ErrNotValid
	}
	bucket, err := this.client.Bucket(p.bucket)
	if err != nil {
		return err
	}
	// uploader := s3manager.NewUploader(this.createSession(p.bucket))
	// input := s3manager.UploadInput{
	// 	Body:   file,
	// 	Bucket: aws.String(p.bucket),
	// 	Key:    aws.String(p.path),
	// }
	// if this.params["encryption_key"] != "" {
	// 	input.SSECustomerAlgorithm = aws.String("AES256")
	// 	input.SSECustomerKey = aws.String(this.params["encryption_key"])
	// }
	// _, err := uploader.Upload(&input)
	err = bucket.PutObject(p.path, file)
	return err
}

// func (this OSSBackend) createSession(bucket string) *session.Session {
// 	newParams := map[string]string{"bucket": bucket}
// 	for k, v := range this.params {
// 		newParams[k] = v
// 	}
// 	c := OSSCache.Get(newParams)
// 	if c == nil {
// 		res, err := this.client.GetBucketLocation(&s3.GetBucketLocationInput{
// 			Bucket: aws.String(bucket),
// 		})
// 		if err != nil {
// 			this.config.Region = aws.String("us-east-1")
// 		} else {
// 			if res.LocationConstraint == nil {
// 				this.config.Region = aws.String("us-east-1")
// 			} else {
// 				this.config.Region = res.LocationConstraint
// 			}
// 		}
// 		OSSCache.Set(newParams, this.config.Region)
// 	} else {
// 		this.config.Region = c.(*string)
// 	}
// 	sess := session.New(this.config)
// 	return sess
// }

type OSSPath struct {
	bucket string
	path   string
}

func (s OSSBackend) path(p string) OSSPath {
	sp := strings.Split(p, "/")
	bucket := ""
	if len(sp) > 1 {
		bucket = sp[1]
	}
	path := ""
	if len(sp) > 2 {
		path = strings.Join(sp[2:], "/")
	}
	return OSSPath{
		bucket,
		path,
	}
}

// listObjects returns a list of objects with the specified prefix
func listObjects(bucket *oss.Bucket, prefix string) ([]oss.ObjectProperties, error) {
	var objects []oss.ObjectProperties

	marker := ""
	for {
		result, err := bucket.ListObjects(oss.Prefix(prefix), oss.Marker(marker))
		if err != nil {
			return nil, err
		}

		objects = append(objects, result.Objects...)

		if result.IsTruncated {
			marker = result.NextMarker
		} else {
			break
		}
	}

	return objects, nil
}
